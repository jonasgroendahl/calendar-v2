import React, { PureComponent, Fragment } from "react";
import {
  Drawer, List, IconButton, Grid, TextField, Divider, ListItem, Select, MenuItem, BottomNavigation, BottomNavigationAction, FormControl, InputLabel, Avatar, ListItemText, Card, ListItemIcon, Tooltip, Button, CardActions, Popper, ClickAwayListener, ListItemSecondaryAction, ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, FormControlLabel, Switch, Input, OutlinedInput
} from "@material-ui/core";
import {
  Search, ChevronLeft, Videocam, Person, NotificationsActive, Clear, Event, Add, Delete, PriorityHigh, ExpandMore, Info, Star
} from "@material-ui/icons";
import styled from "styled-components";
import { Draggable } from "fullcalendar";
import { TimePicker } from "material-ui-pickers";
import { format } from "date-fns";
import { levels, categories } from "../static";
//import { Draggable } from "react-beautiful-dnd";

const ClassWrapper = styled.div`
  overflow: auto;
  height: 100%;
`;

const LeftDrawerTopBar = styled(ListItem)`
  display: flex !important;
  justify-content: center !important;
  padding: 0px !important;
`;



export default class LeftDrawer extends PureComponent {
  state = {
    filters: {
      level: "None",
      category: "None",
      provider: "None",
      language: "None"
    },
    content: [],
    search: "",
    matches: 15,
    eventType: 3,
    isShowingFilters: false,
    showEventType: 0,
    replacing: {
      from: null,
      to: null
    },
    anchorElCalendar: null,
    view: "CLASS_OVERVIEW",
    rule: {
      start: new Date(),
      end: new Date(),
      day: 1
    },
    ruleEnd: new Date(),
    startIsSet: false,
    isTimePickerVisible: false,
    showFavorites: 0,
    languages: [],
    providers: []
  };

  ClassWrapperRef = React.createRef();
  TimePickerRef = React.createRef();


  componentDidUpdate(prevProps, prevState) {
    if (prevProps.content.length === 0 && this.props.content.length > 0) {
      console.log("Content was added, making them draggable");
      let providers = [];
      let languages = [];
      this.props.content.forEach(cl => {
        if (languages.indexOf(cl.language) === -1) {
          languages.push(cl.language);
        }
        if (!providers.find(prov => prov.value === cl.sf_masterid)) {
          providers.push({ value: cl.sf_masterid, text: cl.provider_name });
        }
      })
      this.setState(prevState => {
        const newState = { ...prevState };
        newState.providers = providers;
        newState.languages = languages;
        return newState;
      });
      new Draggable(this.ClassWrapperRef.current, {
        itemSelector: ".event"
      });
      this.ClassWrapperRef.current.addEventListener("scroll", event => {
        if (
          Math.ceil(event.target.clientHeight + event.target.scrollTop) >=
          event.target.scrollHeight
        ) {
          const { matches } = this.state;
          this.setState({ matches: matches + 10 });
        }
      });
    }
    if (prevProps.isReplacing !== this.props.isReplacing) {
      this.setState({ replacing: { to: null, from: null } });
    }
  }

  filterChangeHandler = event => {
    const filters = { ...this.state.filters };
    filters[event.target.name] = event.target.value;
    this.setState({ filters });
  };

  searchHandler = event => {
    this.setState({
      search: event.target.value,
      matches: 10,
      showEventType: 0,
      eventType: 3
    });
  };

  viewChangeHandler = event => {
    this.setState({ view: event.target.value });
    this.calendar.changeView(event.target.value);
  };

  onEventTypeChange = (_, value) => {
    console.log(value);
    this.setState(prevState => {
      const newState = { ...prevState };
      if (value === 0) {
        newState.eventType = 3;
        newState.view = 'CLASS_OVERVIEW';
      }
      if (value === 1) {
        newState.eventType = 100;
        newState.view = 'CLASS_OVERVIEW';
      }
      else if (value === 2) {
        newState.view = 'KEYS';
      }
      newState.showEventType = value;
      return newState;
    });
  };

  toggleFilters = () => {
    const { isShowingFilters } = this.state;
    this.setState({ isShowingFilters: !isShowingFilters });
  };

  clearFilterHandler = () => {
    const filters = { ...this.state.filters };
    Object.keys(filters).forEach(filter => (filters[filter] = "None"));
    this.setState({ filters });
  };

  handleClick = index => {
    if (this.props.isReplacing) {
      const replacing = { ...this.state.replacing };
      const content = [...this.props.content];
      const entry = content[index];
      if (!replacing.from && entry !== this.state.replacing.to) {
        replacing.from = entry;
      } else if (this.state.replacing.from === entry) {
        console.log("same item");
        replacing.from = null;
      } else if (
        !this.state.replacing.to &&
        entry !== this.state.replacing.from
      ) {
        replacing.to = entry;
      } else if (this.state.replacing.to === entry) {
        replacing.to = null;
      }
      this.setState({ replacing }, () => {
        if (this.state.replacing.to && this.state.replacing.from) {
          this.props.replace(
            this.state.replacing.from.indslagid,
            this.state.replacing.to
          );
          setTimeout(() => {
            const replacing = { ...this.state.replacing };
            replacing.to = null;
            replacing.from = null;
            this.props.toggleIsReplacing();
            this.setState({ replacing });
          }, 400);
        }
      });
    }
  };

  addCalendar = () => {
    this.setState({ anchorElCalendar: null });
    this.props.toggleCalendarDialog();
  };

  toggleCalendarPopper = event => {
    console.log("toggleCalendarPopper", event);
    if (!this.state.anchorElCalendar) {
      this.setState({ anchorElCalendar: event.currentTarget });
    } else {
      this.setState({ anchorElCalendar: null });
    }
  };

  changeCalendar = (id) => {
    this.toggleCalendarPopper();
    this.props.changeCalendarHandler(id);
  }


  onClickAway = event => {
    console.log(event.target !== document.querySelector("#button path"));
    if (
      event.target.toString() !==
      document.querySelector("#button path").toString()
    ) {
      this.setState({ anchorElCalendar: null });
    }
  };

  handleViewChange = () => {
    if (this.state.view === "CLASS_OVERVIEW") {
      this.setState({ view: "KEYS" });
    } else {
      this.setState({ view: "CLASS_OVERVIEW" });
    }
  };

  handleRuleChange = event => {
    const rule = { ...this.state.rule };
    rule[event.target.name] = event.target.value;
    this.setState({ rule });
  };

  addRule = () => {
    const { rule } = this.state;
    console.log(rule);
    const newRule = {
      day: rule.day,
      start: format(rule.start, 'HH:mm'),
      end: format(rule.end, 'HH:mm')
    };
    console.log("new rule", newRule);
    if (newRule.start && newRule.end) {
      this.props.addRule(newRule.day, newRule.start, newRule.end);
    }
    this.setState({ isTimePickerVisible: false, startIsSet: false });
  };

  mapDay = day => {
    switch (day) {
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      case 0:
        return "Sunday";
      default:
        return "Unknown day";
    }
  };

  render() {
    const {
      search,
      filters,
      matches,
      eventType,
      isShowingFilters,
      showEventType,
      replacing,
      anchorElCalendar,
      view,
      rule,
      showFavorites,
      providers,
      languages
    } = this.state;

    const { content } = this.props;


    let localMatches = 0;
    let classes = [];
    if (view === "CLASS_OVERVIEW") {
      let eventsToReplace;
      const isReplacing = this.props.isReplacing && !replacing.from;
      if (isReplacing) {
        eventsToReplace = new Set(
          this.props.calendar
            .getEvents()
            .map(event => event.extendedProps.video_id)
        );
        console.log(eventsToReplace);
      }
      classes = content.map((c, contIndex) => {
        let match =
          c.sf_engelsktitel
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          c.indslagtypeid === eventType &&
          (c.sf_level === filters.level ||
            filters.level === "None") &&
          (c.sf_kategori === filters.category || filters.category === "None") &&
          (c.sf_masterid === filters.provider || filters.provider === 'None') &&
          (c.language === filters.language || filters.language === 'None') &&
          (!showFavorites || (showFavorites && c.fav));
        if (isReplacing) {
          match = isReplacing && eventsToReplace.has(c.indslagid);
        }
        if (match && localMatches < matches) {
          localMatches++;
          const json = `{ "title" : "${c.sf_engelsktitel}", "sf_varighedsec" : "${c.sf_varighedsec}", "duration" : "${c.sf_varighed}", "video_id" : ${
            c.indslagid}, "sf_masterid" : ${c.sf_masterid}, "navn" : "${c.navn}", "level": "${c.sf_level}", "language": "${c.language}", "create" : false}`;
          return (
            <ListItem
              className="event"
              button
              key={c.indslagid}
              onClick={() => this.handleClick(contIndex)}
              data-event={json}
            >
              <Avatar
                src={`https://nfoo-server.com/wexerpreview/${
                  c.sf_masterid
                  }_${c.navn.substr(
                    0,
                    c.navn.length - 4
                  )}Square.jpg`}
              />
              <ListItemText
                secondary={
                  c === replacing.from
                    ? "Select a class to replace this one ..."
                    : c === replacing.to
                      ? "Replacing with this class ..."
                      : ""
                }
              >
                {c.sf_engelsktitel}
              </ListItemText>
            </ListItem>
          );
        } else if (
          match
        ) {
          localMatches++;
          return null;
        } else {
          return null;
        }
      });
      // if no matches

      if (classes && classes.every(cl => cl === null)) {
        classes = (
          <ListItem>
            <ListItemIcon style={{ animation: "2s ringing infinite" }}>
              <NotificationsActive />
            </ListItemIcon>
            <ListItemText>No classes found!</ListItemText>
          </ListItem>
        );
      }
    } else {
      classes = (
        <Fragment>
          <div>
            {this.props.rules.map((rule, index) => (
              <ListItem>
                <ListItemText secondary={`Rule no. ${index}`}>
                  {this.mapDay(rule.daysOfWeek[0])}, {rule.startTime} -{" "}
                  {rule.endTime}
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton onClick={() => this.props.deleteRule(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </div>
        </Fragment>
      );
    }

    // filterText
    let filterText = '';
    let filterCount = 0;
    Object.values(filters).forEach(f => {
      if (f !== "None") {
        filterCount++;
      }
    });

    if (filterCount > 0) {
      filterText = `, ${filterCount} filter(s) applied`;
    }

    // calendarText

    let calendarText = '';
    if (this.props.selectedCalendar !== 0) {
      const calendar = this.props.calendars.find(c => c.id === this.props.selectedCalendar);
      calendarText = calendar ? calendar.name : '';
    }
    return (
      <Drawer
        id="leftdrawer"
        variant="persistent"
        anchor="left"
        open={this.props.show}
        PaperProps={{ style: { width: 'var(--drawerWidth)', overflow: 'hidden' } }}
      >
        <List>
          <LeftDrawerTopBar>
            <IconButton onClick={this.props.toggleDrawerHandler}>
              <ChevronLeft />
            </IconButton>
            <Tooltip
              title={
                this.props.calendars.length > 0 ? this.props.calendars.find(
                  cl => cl.id === this.props.selectedCalendar
                ).name : 'Create a new calendar'
              }
            >
              <IconButton onClick={this.toggleCalendarPopper} id="button">
                <Event />
              </IconButton>
            </Tooltip>
            <span className="text--wrap" style={{ maxWidth: '50%' }}>{calendarText}</span>
            <Popper
              open={Boolean(anchorElCalendar)}
              anchorEl={anchorElCalendar}
              style={{ zIndex: 9999 }}
            >
              <ClickAwayListener onClickAway={this.onClickAway}>
                <Card elevation={5}>
                  <List style={{ maxHeight: '40vh', overflow: 'auto' }}>
                    {this.props.calendars.length > 0 ?
                      <ListItem>
                        <Avatar>
                          <Event />
                        </Avatar>
                        <ListItemText
                          secondary={`ID: ${this.props.selectedCalendar}`}
                        >
                          {
                            this.props.calendars.length > 0 && this.props.calendars.find(
                              cl => cl.id === this.props.selectedCalendar
                            ).name
                          }
                        </ListItemText>
                      </ListItem>
                      :
                      <ListItem>
                        <Avatar>
                          <PriorityHigh />
                        </Avatar>
                        <ListItemText
                          secondary={``}
                        >
                          No calendars found. Create one!
                  </ListItemText>
                      </ListItem>
                    }
                    <Divider />
                    {this.props.calendars.map(
                      calendar =>
                        calendar.id !== this.props.selectedCalendar && (
                          <ListItem
                            button
                            onClick={() =>
                              this.changeCalendar(calendar.id)
                            }
                          >
                            <ListItemText secondary={`ID: ${calendar.id}`}>
                              {calendar.name}
                            </ListItemText>
                            <ListItemSecondaryAction>
                              <IconButton onClick={() => this.props.deleteCalendar(calendar.id)}>
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )
                    )}
                  </List>
                  <Divider />
                  <CardActions>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={this.addCalendar}
                    >
                      New <Add style={{ marginLeft: 5 }} />
                    </Button>
                  </CardActions>
                </Card>
              </ClickAwayListener>
            </Popper>
          </LeftDrawerTopBar>
        </List>
        <Divider />
        <List style={{ paddingTop: 0 }}>
          <ListItem style={{ paddingTop: 3 }}>
            <Grid container spacing={8} alignItems="flex-end" wrap={'nowrap'}>
              <Grid item style={{ marginBottom: 8 }}>
                <Search />
              </Grid>
              <Grid item>
                <TextField
                  label="Search"
                  value={search}
                  name="level"
                  onChange={this.searchHandler}
                  helperText={`Matches: ${localMatches} ${filterText}`}
                />
              </Grid>
            </Grid>
          </ListItem>
          <div style={{ height: 'calc(100vh - 218px)' }}>
            {view === 'CLASS_OVERVIEW' &&
              <ListItem style={{ padding: 5 }}>
                <ExpansionPanel elevation={isShowingFilters ? 1 : 0} CollapseProps={{ timeout: 300 }} style={{ width: '100%' }}>
                  <ExpansionPanelSummary expandIcon={<ExpandMore />} expanded={isShowingFilters} onClick={() => this.setState({ isShowingFilters: !this.state.isShowingFilters })}>
                    <Typography className={classes.heading}>Filters</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{ flexFlow: 'wrap row' }}>
                    <Grid container spacing={8}>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined" >
                          <InputLabel htmlFor="level">Level</InputLabel>
                          <Select
                            onChange={this.filterChangeHandler}
                            value={filters.level}
                            name="level"
                            input={<OutlinedInput
                              labelWidth={40}
                              id="level" />}
                            style={{ fontSize: 12 }}
                          >
                            {levels.map(level => (
                              <MenuItem
                                value={level.value}
                                key={`level_${level.text}`}
                              >
                                {level.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="provider">Provider</InputLabel>
                          <Select
                            onChange={this.filterChangeHandler}
                            value={filters.provider}
                            name="provider"
                            input={<OutlinedInput
                              labelWidth={70}
                              id="provider" />}
                            style={{ fontSize: 12 }}
                          >
                            <MenuItem value="None">None</MenuItem>
                            {providers.map(provider => (
                              <MenuItem
                                value={provider.value}
                                key={`provider_${provider.text}`}
                              >
                                {provider.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container spacing={8} style={{ marginTop: 5 }}>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="language">Language</InputLabel>
                          <Select
                            onChange={this.filterChangeHandler}
                            value={filters.language}
                            name="language"
                            input={<OutlinedInput
                              labelWidth={70}
                              id="language" />}
                            style={{ fontSize: 12 }}
                          >
                            <MenuItem value="None">None</MenuItem>
                            {languages.map(language => (
                              <MenuItem
                                value={language}
                                key={`language_${language}`}
                              >
                                {language}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="category">Category</InputLabel>
                          <Select
                            onChange={this.filterChangeHandler}
                            value={filters.category}
                            name="category"
                            label="Filter by category"
                            input={<OutlinedInput
                              labelWidth={65}
                              id="category" />}
                            style={{ fontSize: 12 }}
                          >
                            {categories.map(cat => (
                              <MenuItem value={cat.value} key={`cat_${cat.text}`}>
                                {cat.text}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid item className="ml-auto">
                      <Tooltip title="Clear filters">
                        <IconButton onClick={this.clearFilterHandler} style={{ marginRight: 5 }}>
                          <Clear />
                        </IconButton>
                      </Tooltip>
                      <FormControlLabel
                        control={
                          <Switch
                            value={this.state.showFavorites}
                            onChange={(_, checked) => this.setState({ showFavorites: checked })}
                            color="primary"
                          />
                        }
                        label="Favorites only"
                      />
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </ListItem>
            }
            {view !== 'CLASS_OVERVIEW' &&
              <Fragment>
                <ExpansionPanel elevation={0}>
                  <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                    <div className="flex">
                      <Tooltip title="RULE: Disable Ondemand allows you to select timeframes where users may not be able to start OnDemand classes">
                        <Info style={{ marginRight: 10 }} />
                      </Tooltip>
                      <span>Disable On Demand</span>
                    </div>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className="flex column">
                    <FormControl>
                      <InputLabel htmlFor="day">Day</InputLabel>
                      <Select
                        value={rule.day}
                        disableUnderline
                        onChange={this.handleRuleChange}
                        name="day"
                        input={<Input id="day" />}
                      >
                        <MenuItem value={1}>Monday</MenuItem>
                        <MenuItem value={2}>Tuesday</MenuItem>
                        <MenuItem value={3}>Wednesday</MenuItem>
                        <MenuItem value={4}>Thursday</MenuItem>
                        <MenuItem value={5}>Friday</MenuItem>
                        <MenuItem value={6}>Saturday</MenuItem>
                        <MenuItem value={0}>Sunday</MenuItem>
                      </Select>
                    </FormControl>
                    <TimePicker label="Start time" value={rule.start} ampm={this.props.settings.slotLabelFormat === 'ampm'} onChange={(start, t, x) => {
                      const rule = { ...this.state.rule };
                      rule.start = start;
                      this.setState({ rule });
                    }} />
                    <TimePicker label="End time" value={rule.end} ampm={this.props.settings.slotLabelFormat === 'ampm'} onChange={(end, t, x) => {
                      const rule = { ...this.state.rule };
                      rule.end = end;
                      this.setState({ rule });
                    }} />
                    <Button color="primary" onClick={this.addRule}>
                      Add rule
              </Button>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Fragment>}
            <ClassWrapper
              className="ClassWrapper"
              innerRef={this.ClassWrapperRef}
            >
              {classes}
            </ClassWrapper>
          </div>
          <BottomNavigation
            value={showEventType}
            onChange={this.onEventTypeChange}
            showLabels
            style={{ marginTop: 'auto' }}
          >
            <BottomNavigationAction label="Classes" icon={<Videocam />} style={{ background: '#fff', height: 60 }} />
            <BottomNavigationAction label="My classes" icon={<Person />} style={{ background: '#fff', height: 60 }} />
            <BottomNavigationAction label="Rules" icon={<Star />} style={{ background: '#fff', height: 60 }} />
          </BottomNavigation>
        </List>
      </Drawer >
    );
  }
}
