import React, { Component } from "react";
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
  Tooltip
} from "@material-ui/core";
import {
  Search,
  ChevronRight,
  Videocam,
  Person,
  Favorite,
  FilterList,
  NotificationsActive,
  Clear
} from "@material-ui/icons";
import axios from "./../../axios";
import dragula from "fullcalendar/dist/dragula.min.js";

export default class LeftDrawer extends Component {
  state = {
    filters: {
      level: "None",
      category: "None"
    },
    content: [],
    search: "",
    matches: 12,
    eventType: 3,
    content: [],
    levels: [
      { value: "None", text: "None" },
      { value: "For everyone", text: "For everyone" },
      { value: "Beginner", text: "Beginner" },
      { value: "Intermediate", text: "Intermediate" },
      { value: "Advanced", text: "Advanced" }
    ],
    categories: [
      { value: "None", text: "None" },
      { value: "Weight loss and healthy heart (Cardio)", text: "Cardio" },
      { value: "D'stress and relax (Mind-body)", text: "Mind Body" },
      { value: "Kids (Kids)", text: "Kids" },
      { value: "Senior (Senior)", text: "Senior" },
      { value: "Cycling (Cycling)", text: "Cycling" },
      { value: "Strong and firm(Conditioning)", text: "Conditioning" }
    ],
    isShowingFilters: false,
    showEventType: 0
  };

  async componentDidMount() {
    const content = await axios.get("/v2/content");
    this.setState({ content: content.data });
  }

  componentDidUpdate(_, prevState) {
    if (prevState.content.length === 0 && this.state.content.length > 0) {
      console.log("Content was added, making them draggable");
      const draggableEvents = document.querySelector(".test");
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
  }

  filterChangeHandler = event => {
    const { filters } = this.state;
    filters[event.target.name] = event.target.value;
    console.log(event.target.name);
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
    const { filters } = this.state;
    Object.keys(filters).forEach(filter => (filters[filter] = "None"));
    this.setState({ filters });
  };

  render() {
    const {
      search,
      filters,
      levels,
      matches,
      eventType,
      content,
      isShowingFilters,
      categories,
      showEventType
    } = this.state;

    let localMatches = 0;
    let classes = [];
    classes = content.map(contentEntry => {
      if (
        contentEntry.sf_engelsktitel
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        contentEntry.indslagtypeid === eventType &&
        (contentEntry.sf_level === filters.level || filters.level === "None") &&
        (contentEntry.sf_kategori === filters.category ||
          filters.category === "None") &&
        localMatches < matches
      ) {
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
          >
            <Avatar
              src={`https://nfoo-server.com/wexerpreview/${
                contentEntry.sf_masterid
              }_${contentEntry.navn.substr(
                0,
                contentEntry.navn.length - 4
              )}Square.jpg`}
            />
            <ListItemText>{contentEntry.sf_engelsktitel}</ListItemText>
          </ListItem>
        );
      } else if (
        contentEntry.sf_engelsktitel
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        contentEntry.indslagtypeid === eventType &&
        (contentEntry.sf_level === filters.level || filters.level === "None") &&
        (contentEntry.sf_kategori === filters.category ||
          filters.category === "None")
      ) {
        localMatches++;
      }
    });
    // if no matches

    if (classes && classes.every(cl => cl === undefined)) {
      classes = (
        <ListItem>
          <ListItemIcon>
            <NotificationsActive />
          </ListItemIcon>
          <ListItemText>No classes found!</ListItemText>
        </ListItem>
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
        PaperProps={{ style: { maxWidth: 294 } }}
      >
        <div>
          <IconButton onClick={this.props.toggleDrawerHandler}>
            <ChevronRight />
          </IconButton>
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
              <IconButton onClick={this.toggleFilters}>
                <FilterList />
              </IconButton>
              {filterText}
              <Avatar />
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
                              <MenuItem value={level.value}>
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
                              <MenuItem value={cat.value}>{cat.text}</MenuItem>
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
                </Card>
              </Popover>
            </ListItem>
            <div className="test">{classes}</div>
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
        </div>
      </Drawer>
    );
  }
}
