import React, { PureComponent } from "react";
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
  CardActions
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
import ListIcon from "@material-ui/icons/List";
import axios from "./../../axios";
import dragula from "fullcalendar/dist/dragula.min.js";

export default class LeftDrawer extends PureComponent {
  state = {
    filters: {
      level: "None",
      category: "None"
    },
    content: [],
    search: "",
    matches: 12,
    eventType: 3,
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
    showEventType: 0,
    replacing: {
      from: null,
      to: null
    }
  };

  async componentDidMount() {
    const content = await axios.get("/v2/content");
    /*
    const finalContent = [
      {
        indslagid: 9999,
        sf_engelsktitel: "Disable On-Demand",
        sf_kategori: "",
        sf_level: "",
        sf_varighed: "00:30:00",
        indslagtypeid: 3,
        navn: "ondemand.mp4",
        sf_masterid: 9999
      },
      ...content.data
    ];
    */
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

  handleClick = (index) => {
    if (this.props.isReplacing) {
      const replacing = { ...this.state.replacing };
      const content = [...this.state.content];
      const entry = content[index];
      if (!replacing.from && entry !== this.state.replacing.to) {
        replacing.from = entry;
      }
      else if (this.state.replacing.from === entry) {
        console.log("same item");
        replacing.from = null;
      }
      else if (!this.state.replacing.to && entry !== this.state.replacing.from) {
        replacing.to = entry;
      }
      else if (this.state.replacing.to === entry) {
        replacing.to = null;
      }
      this.setState({ replacing }, () => {
        if (this.state.replacing.to && this.state.replacing.from) {
          this.props.replace(this.state.replacing.from.indslagid, this.state.replacing.to);
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
  }

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
      showEventType,
      replacing
    } = this.state;

    let localMatches = 0;
    let classes = [];
    classes = content.map((contentEntry, contIndex) => {
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
            <ListItemText secondary={contentEntry === replacing.from ? 'Replacing from...' : contentEntry === replacing.to ? 'Replacing to' : ''}>{contentEntry.sf_engelsktitel}</ListItemText>
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
        <div>
          <IconButton onClick={this.props.toggleDrawerHandler}>
            <ChevronRight />
          </IconButton>
        </div>
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
            {/*<IconButton>
              <ListIcon />
            </IconButton>*/}
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
      </Drawer>
    );
  }
}
