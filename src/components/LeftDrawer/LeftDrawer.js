import React, { PureComponent, Fragment } from "react";
import {
  Drawer, List, IconButton, Grid, TextField, Divider, ListItem, Select, MenuItem, BottomNavigation, BottomNavigationAction, FormControl, InputLabel, Avatar, ListItemText, Card, ListItemIcon, Tooltip, Button, CardActions, Popper, ClickAwayListener, ListItemSecondaryAction, ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, FormControlLabel, Switch, Input, OutlinedInput, Menu, ListItemAvatar
} from "@material-ui/core";
import {
  Search, ChevronLeft, Videocam, Person, NotificationsActive, Clear, Event, Delete, PriorityHigh, ExpandMore, Info, Star
} from "@material-ui/icons";
import { Draggable } from "fullcalendar";
import { format, setDay } from "date-fns";
import { levels, categories } from "../static";
import MenuIcon from "@material-ui/icons/Menu";



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
    anchorElClass: null,
    view: "CLASS_OVERVIEW",
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
      let providers = [];
      let languages = [];
      this.props.content.forEach((cl, index) => {
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
        itemSelector: ".event",
        eventData: (eventEl) => {
          const eventData = this.props.content.find(cl => cl.indslagid === parseInt(eventEl.getAttribute('video_id'), 10));
          return {
            title: eventData.sf_engelsktitel,
            duration: eventData.sf_varighed,
            language: eventData.language,
            languageShort: eventData.languageShort,
            indslagtypeid: eventData.indslagtypeid,
            sf_kategori: eventData.sf_kategori,
            sf_masterid: eventData.sf_masterid,
            sf_level: eventData.sf_level,
            navn: eventData.navn,
            providerName: eventData.provider_name,
            indslagid: eventData.indslagid,
            sf_varighedsec: eventData.sf_varighedsec,
            sf_varighed: eventData.sf_varighed
          }
        }
      });

      this.ClassWrapperRef.current.addEventListener("scroll", event => {
        if (Math.ceil(event.target.clientHeight + event.target.scrollTop) >= event.target.scrollHeight) {
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
      matches: 15,
      showEventType: 0,
      eventType: 3
    });
  };

  viewChangeHandler = event => {
    this.setState({ view: event.target.value });
    this.calendar.changeView(event.target.value);
  };

  onEventTypeChange = (_, value) => {
    this.setState(prevState => {
      const newState = { ...prevState };
      newState.matches = 15;
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
    if (event.target.toString() !== document.querySelector("#button path").toString()) {
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

  addRule = () => {
    const { rule } = this.state;
    const newRule = {
      day: rule.day,
      start: format(rule.start, 'HH:mm'),
      end: format(rule.end, 'HH:mm')
    };
    if (newRule.start && newRule.end) {
      this.props.addRule(newRule.day, newRule.start, newRule.end);
    }
    this.setState({ isTimePickerVisible: false, startIsSet: false });
  };

  toggle = () => {
    this.props.toggleDrawerHandler();
    this.setState({ matches: 15 });
  }

  mapDay = day => {
    const date = setDay(new Date(), parseInt(day, 10));
    return format(date, 'EEEE');
  };

  toggleClassMenu = (event) => {
    this.setState({ anchorElClass: event ? event.target : null });
  }

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
      showFavorites,
      providers,
      languages,
      anchorElClass
    } = this.state;

    const { content } = this.props;


    let localMatches = 0;
    let classes = [];
    if (view === "CLASS_OVERVIEW") {
      let eventsToReplace;
      const isReplacing = this.props.isReplacing && !replacing.from;
      if (isReplacing) {
        eventsToReplace = new Set(this.props.calendar.getEvents().map(event => event.extendedProps.video_id));
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
          return (
            <ListItem
              className="event"
              button
              key={c.indslagid}
              onClick={() => this.handleClick(contIndex)}
              video_id={c.indslagid}
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
                primary={c.sf_engelsktitel}
                secondary={
                  c === replacing.from
                    ? "Select a class to replace this one ..."
                    : c === replacing.to
                      ? "Replacing with this class ..."
                      : `${c.language}`
                }
                className="list-item-text--wrap"
              />
              <ListItemSecondaryAction>
                <IconButton onClick={this.toggleClassMenu}>
                  <MenuIcon />
                </IconButton>
              </ListItemSecondaryAction>
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
              <ListItem key={`rule_${index}`}>
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
      <Fragment>
        <Drawer
          id="leftdrawer"
          variant="persistent"
          anchor="left"
          open={this.props.show}
          PaperProps={{ style: { width: 'var(--drawerWidth)', overflow: 'hidden' } }}
        >
          <List>
            <div className="top-drawer-div">
              <span className="text--wrap" style={{ maxWidth: '60%', textTransform: 'uppercase' }}>{calendarText}</span>
              <div className="ml-auto">
                <Tooltip
                  title={'Choose a calendar'}
                  disableFocusListener
                >
                  <IconButton onClick={this.toggleCalendarPopper} id="button">
                    <Event />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={this.toggle}>
                  <ChevronLeft />
                </IconButton>
              </div>
              <Popper
                open={Boolean(anchorElCalendar)}
                anchorEl={anchorElCalendar}
                style={{ zIndex: 9999 }}
              >
                <ClickAwayListener onClickAway={this.onClickAway}>
                  <Card elevation={5}>
                    <List style={{ minWidth: 270 }}>
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
                      <div style={{ maxHeight: '40vh', overflow: 'auto' }}>
                        {this.props.calendars.map(
                          calendar =>
                            calendar.id !== this.props.selectedCalendar && (
                              <ListItem
                                button
                                onClick={() =>
                                  this.changeCalendar(calendar.id)
                                }
                                key={`calendar_${calendar.id}`}
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
                      </div>
                    </List>
                    <Divider />
                    <CardActions style={{ justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.addCalendar}
                      >
                        New
                    </Button>
                    </CardActions>
                  </Card>
                </ClickAwayListener>
              </Popper>
            </div>
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
                  <ListItem button onClick={this.props.toggleRuleDialog}>
                    <ListItemAvatar>
                      <Tooltip title="Rule: Disable OnDemand allows you to select timeframes where users may not be able to start OnDemand classes">
                        <Avatar>
                          <Info />
                        </Avatar>
                      </Tooltip>
                    </ListItemAvatar>
                    <ListItemText primary="Disable On Demand" />
                  </ListItem>
                </Fragment>
              }
              <div className="class-wrapper" ref={this.ClassWrapperRef}>
                {classes}
              </div>
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
        </Drawer>
        <Menu
          anchorEl={anchorElClass}
          open={Boolean(anchorElClass)}
          onClose={() => this.toggleClassMenu(null)}
        >
          <MenuItem onClick={() => this.toggleClassMenu(null)}>View in library</MenuItem>
        </Menu>
      </Fragment>
    );
  }
}
