import React, { PureComponent, Fragment } from "react";
import {
  Drawer,
  List,
  IconButton,
  Grid,
  TextField,
  Divider,
  ListItem,
  Select,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  FormControl,
  InputLabel,
  Avatar,
  ListItemText,
  Popover,
  Card,
  CardContent,
  ListItemIcon,
  Tooltip,
  Button,
  CardActions,
  Popper,
  ClickAwayListener,
  ListItemSecondaryAction
} from "@material-ui/core";
import {
  Search,
  ChevronRight,
  Videocam,
  Person,
  Favorite,
  FilterList,
  NotificationsActive,
  Clear,
  Event,
  Add,
  Receipt,
  KeyboardBackspace,
  Delete
} from "@material-ui/icons";
import axios from "./../../axios";
import dragula from "fullcalendar/dist/dragula.min.js";
import styled from "styled-components";

const ClassWrapper = styled.div`
  height: calc(100vh - 272px);
  overflow: auto;
`;

const LeftDrawerTopBar = styled.div`
  display: flex;
  justify-content: center;
`;

const RulesContainer = styled.div`
  height: calc(100vh - 420px);
  overflow-y: scroll;
`;

export default class LeftDrawer extends PureComponent {
  state = {
    filters: {
      level: "None",
      category: "None"
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
      start: "",
      end: "",
      day: 1
    }
  };

  async componentDidMount() {
    const content = await axios.get("/v2/content");
    this.setState({ content: content.data });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.content.length === 0 && this.state.content.length > 0) {
      console.log("Content was added, making them draggable");
      const draggableEvents = document.querySelector(".ClassWrapper");
      dragula([draggableEvents], { copy: true });
      draggableEvents.addEventListener("scroll", event => {
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
    console.log(event.target.name, event.target.value);
    this.setState({ filters });
  };

  searchHandler = event => {
    this.setState({ search: event.target.value, matches: 10 });
  };

  viewChangeHandler = event => {
    this.setState({ view: event.target.value });
    this.calendar.changeView(event.target.value);
  };

  onEventTypeChange = (_, value) => {
    console.log(value);
    let eventType = 3;
    if (value === 1) {
      eventType = 100;
    } else if (value === 2) {
      eventType = 5;
    }
    this.setState({ showEventType: value, eventType });
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
      const content = [...this.state.content];
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
    const newRule = {
      day: rule.day,
      start: rule.start,
      end: rule.end
    };
    if (newRule.start && newRule.end) {
      this.props.addRule(newRule.day, newRule.start, newRule.end);
    }
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
      case 7:
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
      content,
      isShowingFilters,
      showEventType,
      replacing,
      anchorElCalendar,
      view,
      rule
    } = this.state;

    const levels = [
      { value: "None", text: "None" },
      { value: "For everyone", text: "For everyone" },
      { value: "Beginner", text: "Beginner" },
      { value: "Intermediate", text: "Intermediate" },
      { value: "Advanced", text: "Advanced" }
    ];
    const categories = [
      { value: "None", text: "None" },
      { value: "Weight loss and healthy heart (Cardio)", text: "Cardio" },
      { value: "D'stress and relax (Mind-body)", text: "Mind Body" },
      { value: "Kids (Kids)", text: "Kids" },
      { value: "Senior (Senior)", text: "Senior" },
      { value: "Cycling (Cycling)", text: "Cycling" },
      { value: "Strong and firm(Conditioning)", text: "Conditioning" }
    ];

    let localMatches = 0;
    let classes = [];
    if (view === "CLASS_OVERVIEW") {
      let eventsToReplace;
      const isReplacing = this.props.isReplacing && !replacing.from;
      if (isReplacing) {
        eventsToReplace = new Set(
          this.props.calendar.clientEvents().map(event => event.video_id)
        );
        console.log(eventsToReplace);
      }
      classes = content.map((contentEntry, contIndex) => {
        let match =
          contentEntry.sf_engelsktitel
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          contentEntry.indslagtypeid === eventType &&
          (contentEntry.sf_level === filters.level ||
            filters.level === "None") &&
          (contentEntry.sf_kategori === filters.category ||
            filters.category === "None") &&
          localMatches < matches;
        if (isReplacing) {
          match = isReplacing && eventsToReplace.has(contentEntry.indslagid);
        }
        if (match) {
          localMatches++;
          return (
            <ListItem
              className="event"
              button
              data-event={`{ "title" : "${
                contentEntry.sf_engelsktitel
              }", "duration" : "${contentEntry.sf_varighed}", "video_id" : ${
                contentEntry.indslagid
              }, "sf_masterid" : ${contentEntry.sf_masterid}, "navn" : "${
                contentEntry.navn
              }", 
            "level": "${contentEntry.sf_level}"}`}
              key={contentEntry.indslagid}
              onClick={() => this.handleClick(contIndex)}
            >
              <Avatar
                src={`https://nfoo-server.com/wexerpreview/${
                  contentEntry.sf_masterid
                }_${contentEntry.navn.substr(
                  0,
                  contentEntry.navn.length - 4
                )}Square.jpg`}
              />
              <ListItemText
                secondary={
                  contentEntry === replacing.from
                    ? "Select a class to replace this one ..."
                    : contentEntry === replacing.to
                      ? "Replacing with this class ..."
                      : ""
                }
              >
                {contentEntry.sf_engelsktitel}
              </ListItemText>
            </ListItem>
          );
        } else if (
          contentEntry.sf_engelsktitel
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          contentEntry.indslagtypeid === eventType &&
          (contentEntry.sf_level === filters.level ||
            filters.level === "None") &&
          (contentEntry.sf_kategori === filters.category ||
            filters.category === "None")
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
          <ListItem>
            <div className="flex column">
              <ListItemText>
                <strong>Rule:</strong> Disable On Demand
              </ListItemText>
              <Grid container alignItems="center">
                <Grid item xs={3}>
                  <span>Date</span>
                </Grid>
                <Grid
                  item
                  xs={9}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Select
                    value={rule.day}
                    disableUnderline
                    onChange={this.handleRuleChange}
                    name="day"
                  >
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                    <MenuItem value={7}>Sunday</MenuItem>
                  </Select>
                  <div>
                    <input
                      type="time"
                      value={rule.start}
                      name="start"
                      onChange={this.handleRuleChange}
                    />
                    <input
                      type="time"
                      value={rule.end}
                      name="end"
                      onChange={this.handleRuleChange}
                    />
                  </div>
                </Grid>
              </Grid>
              <Divider style={{ marginTop: 10 }} />
              <Button color="primary" onClick={this.addRule}>
                Add rule
              </Button>
            </div>
          </ListItem>
          <RulesContainer>
            {this.props.rules.map((rule, index) => (
              <ListItem>
                <ListItemText secondary={`Rule no. ${index}`}>
                  {this.mapDay(rule.day_of_week)}, {rule.start} - {rule.end}
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton onClick={() => this.props.deleteRule(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </RulesContainer>
        </Fragment>
      );
    }

    // filterText
    let filterText = null;
    let filterCount = 0;
    Object.values(filters).forEach(f => {
      if (f !== "None") {
        filterCount++;
      }
    });

    if (filterCount > 0) {
      filterText = (
        <p className="filter-text">{`${filterCount} filter(s) applied`}</p>
      );
    }
    return (
      <Drawer
        id="leftdrawer"
        variant="persistent"
        anchor="left"
        open={this.props.show}
        PaperProps={{ style: { width: 290 } }}
      >
        <LeftDrawerTopBar>
          <Tooltip
            title={
              this.props.calendars.find(
                cl => cl.id === this.props.selectedCalendar
              ).name
            }
          >
            <IconButton onClick={this.toggleCalendarPopper} id="button">
              <Event />
            </IconButton>
          </Tooltip>
          <Popper
            open={Boolean(anchorElCalendar)}
            anchorEl={anchorElCalendar}
            style={{ zIndex: 9999 }}
          >
            <ClickAwayListener onClickAway={this.onClickAway}>
              <Card elevation={5}>
                <List>
                  <ListItem>
                    <Avatar>
                      <Event />
                    </Avatar>
                    <ListItemText
                      secondary={`ID: ${this.props.selectedCalendar}`}
                    >
                      {
                        this.props.calendars.find(
                          cl => cl.id === this.props.selectedCalendar
                        ).name
                      }
                    </ListItemText>
                  </ListItem>
                  <Divider />
                  {this.props.calendars.map(
                    calendar =>
                      calendar.id !== this.props.selectedCalendar && (
                        <ListItem
                          button
                          onClick={() =>
                            this.props.changeCalendarHandler(calendar.id)
                          }
                        >
                          <ListItemText secondary={`ID: ${calendar.id}`}>
                            {calendar.name}
                          </ListItemText>
                        </ListItem>
                      )
                  )}
                  <Divider />
                  <CardActions>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={this.addCalendar}
                    >
                      New <Add style={{ marginLeft: 5 }} />
                    </Button>
                  </CardActions>
                </List>
              </Card>
            </ClickAwayListener>
          </Popper>
          <IconButton onClick={this.props.toggleDrawerHandler}>
            <ChevronRight />
          </IconButton>
        </LeftDrawerTopBar>
        <Divider />
        <List style={{ paddingTop: 0 }}>
          <ListItem style={{ paddingTop: 3 }}>
            <Grid container spacing={8} alignItems="flex-end">
              <Grid item style={{ marginBottom: 8 }}>
                <Search />
              </Grid>
              <Grid item>
                <TextField
                  label="Search"
                  value={search}
                  name="level"
                  onChange={this.searchHandler}
                  helperText={`Matches: ${localMatches}`}
                />
              </Grid>
            </Grid>
          </ListItem>
          <ListItem>
            <Tooltip title="Apply filters">
              <IconButton onClick={this.toggleFilters}>
                <FilterList />
              </IconButton>
            </Tooltip>
            {filterText}
            <Popover open={isShowingFilters} onClose={this.toggleFilters}>
              <Card>
                <CardContent>
                  <Grid container>
                    <Grid item style={{ minWidth: 150, marginRight: 5 }}>
                      <FormControl fullWidth>
                        <InputLabel>Filter by Level</InputLabel>
                        <Select
                          onChange={this.filterChangeHandler}
                          value={filters.level}
                          name="level"
                          label="Filter by level"
                          disableUnderline
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
                    <Grid item style={{ minWidth: 150, marginRight: 5 }}>
                      <FormControl fullWidth>
                        <InputLabel>Filter by Category</InputLabel>
                        <Select
                          onChange={this.filterChangeHandler}
                          value={filters.category}
                          name="category"
                          label="Filter by category"
                          disableUnderline
                        >
                          {categories.map(cat => (
                            <MenuItem value={cat.value} key={`cat_${cat.text}`}>
                              {cat.text}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Clear filters">
                        <IconButton onClick={this.clearFilterHandler}>
                          <Clear />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions style={{ justifyContent: "flex-end" }}>
                  <Button color="primary" onClick={this.toggleFilters}>
                    Cancel
                  </Button>
                </CardActions>
              </Card>
            </Popover>
            <IconButton onClick={this.handleViewChange}>
              {view === "CLASS_OVERVIEW" ? <Receipt /> : <KeyboardBackspace />}
            </IconButton>
          </ListItem>
          <ClassWrapper className="ClassWrapper">{classes}</ClassWrapper>
          <BottomNavigation
            value={showEventType}
            onChange={this.onEventTypeChange}
            showLabels
          >
            <BottomNavigationAction label="Classes" icon={<Videocam />} />
            <BottomNavigationAction label="Own classes" icon={<Person />} />
            <BottomNavigationAction label="Favorites" icon={<Favorite />} />
          </BottomNavigation>
        </List>
      </Drawer>
    );
  }
}
