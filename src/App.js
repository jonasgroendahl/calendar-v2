import React, { Component } from "react";
import axios from "./axios";
import "./App.css";
import "./Calendar.css";
import "fullcalendar/dist/fullcalendar.min.css";
import { Calendar, moment } from "fullcalendar";
import dragula from 'fullcalendar/dist/dragula.min.js';
import {
  Drawer,
  List,
  ListItem,
  Divider,
  IconButton,
  Toolbar,
  AppBar,
  Tooltip,
  TextField,
  FormControl,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  ListItemText,
  Avatar,
  Card,
  Popper,
  CardContent,
  CardActions,
  Grow,
  Switch,
  FormControlLabel
} from "@material-ui/core";
import { ChevronRight, Layers, Search, Cloud, Delete } from "@material-ui/icons";
import IconMenu from "@material-ui/icons/Menu";
import SelectTypeDialog from "./components/SelectTypeDialog/SelectTypeDialog";


class App extends Component {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
    this.state = {
      isDrawingOpen: true,
      isTypeDialogOpen: false,
      levels: ["None", "For everyone", "Beginner", "Intermediate", "Advanced"],
      filters: {
        level: "None"
      },
      content: [],
      selectedEvent: null,
      selectedEventDetails: null,
      type: 'advanced'
    };
  }

  async componentDidMount() {
    const self = this;
    this.options = {
      events: (start, end, _, callback) => this.fetchData(start, end, _, callback),
      defaultView: "agendaWeek",
      allDaySlot: false,
      editable: true,
      header:
      {
        left: 'title',
        right: 'today prev,next'
      },
      columnFormat: "ddd",
      firstDay: 1,
      slotDuration: "00:10:00",
      height: "parent",
      droppable: true,
      eventReceive: (event) => this.eventReceive(event),
      eventClick: function (event) {
        self.eventClick(this, event);
      },
      eventResize: function () {
        self.setState({ selectedEvent: null });
      }
    };
    this.options.eventClick.bind(this);
    this.calendar = new Calendar(this.refCalendar.current, this.options);
    this.calendar.render();
    this.addScrollListener();
    const content = await axios.get("/v1/pi/content?gym_id=44");
    console.log(content);
    this.setState({ content: content.data });
  }

  componentDidUpdate(_, prevState) {
    if (prevState.content.length == 0 && this.state.content.length > 0) {
      console.log("Content was added, making them draggable");
      const draggableEvents = document.querySelector(".test");
      dragula([draggableEvents], { copy: true, });
    }
  }

  eventClick(element, event) {
    this.setState({ selectedEvent: element, selectedEventDetails: event });
  }

  addScrollListener = () => {
    document.querySelector(".fc-scroller").addEventListener("scroll", () => {
      console.log("scrolling");
      if (this.state.selectedEvent) {
        this.setState({ selectedEvent: null });
      }
    });
  }

  eventReceive = async (event) => {
    console.log(event);
    const payload = {
      start: this.formatDate(event.start),
      end: this.formatDate(event.end)
    }
    await axios.post("/v2/event", payload);
  }

  fetchData = async (start, end, _, callback) => {
    console.log(`fetching data for time period ${start.format()} - ${end.format()}`);
    const response = await axios.get("/v2/event");

    const hello_empty = [];
    response.data.result.forEach(event => {
      if (event.day_of_week) {
        /* Clone view start */
        for (let i = start; i.isSameOrBefore(end); i.add('days', 8)) {
          const eventStart = i.clone();

          const eventStartMoment = moment(event.start);

          eventStart.weekday(event.day_of_week - 1);
          const duration = moment(event.end).diff(moment(event.start));

          eventStart.hours(eventStartMoment.hours());
          eventStart.minutes(eventStartMoment.minutes());
          eventStart.seconds(eventStartMoment.seconds());

          const eventEnd = eventStart.clone();
          eventEnd.add(duration);

          const newEvent = {
            start: eventStart,
            end: eventEnd,
            title: "I'm a recurring event",
            day_of_week: event.day_of_week
          }
          if (event.exceptions.length == 0 || event.exceptions.filter(exp => exp.start === this.formatDate(eventStart)).length == 0) {
            hello_empty.push(newEvent);
          }
        }
      }
      else {
        hello_empty.push(event);
      }
    });
    console.log("hello empty", hello_empty);
    callback(hello_empty);
    /*
    const mappedData = response.data.result.map(event => {
      let color = "";
      switch (event.sf_kategori) {
        case "Cycling (Cycling)":
          color = "var(--eventCycling)";
          break;
        case "D´stress and relax (Mind-body)":
          color = "var(--eventColor)";
          break;
        default:
          color = "var(--eventCycling)";
      }
      return {
        ...event,
        color
      };
    });
    console.log("mappedData", mappedData);
    callback(mappedData);*/
  };

  formatDate = (moment) => {
    return moment.format('YYYY-MM-DD HH:mm:ss');
  }

  selectType = type => {
    if (type == 'simple') {
      this.calendar.option("header", false);
      this.calendar.option("columnFormat", "ddd");
    }
    else {
      this.calendar.option("header", {
        left: 'title',
        right: 'today prev,next'
      });
      this.calendar.option("columnFormat", "ddd M/D");
    }
    this.addScrollListener();
    this.setState({ type, isTypeDialogOpen: false });
  };

  onLevelChange = event => {
    const { filters } = this.state;
    filters.level = event.target.value;
    this.setState({ filters });
  };

  clickAway = () => {
    console.log("clicked away");
    this.setState({ selectedEvent: null });
  }

  toggleRecurring = (event) => {
    const { selectedEventDetails } = this.state;
    if (selectedEventDetails.day_of_week == null) {
      selectedEventDetails.day_of_week = 1;
    }
    else {
      selectedEventDetails.day_of_week = null;
    }
    this.setState({ selectedEventDetails });
  }

  render() {
    const { isDrawingOpen, isTypeDialogOpen, levels, filters, selectedEvent, selectedEventDetails, type } = this.state;

    return (
      <div className="App">
        <div
          className="calendar-container"
          style={{ marginLeft: isDrawingOpen ? "var(--calendarGutter)" : 30 }}
        >
          <AppBar
            position="static"
            style={{ boxShadow: "none", marginBottom: 5 }}
            color="inherit"
          >
            <Toolbar>
              {!isDrawingOpen &&
                <IconButton
                  color="inherit"
                  onClick={() =>
                    this.setState({ isDrawingOpen: !this.state.isDrawingOpen })
                  }
                >

                  <IconMenu />
                </IconButton>
              }
              <div style={{ marginLeft: "auto" }}>
                <Tooltip
                  title="Toggle simple/advanced view"
                >
                  <IconButton
                    color="inherit"
                    onClick={() => this.setState({ isTypeDialogOpen: true })}
                  >
                    <Layers />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Publish changes to the Wexer player">
                  <IconButton
                    color="secondary"
                    onClick={() => this.setState({ isPublishDialogOpen: true })}
                  >
                    <Cloud />
                  </IconButton>
                </Tooltip>
              </div>
            </Toolbar>
          </AppBar>
          <div id="calendar" ref={this.refCalendar} />
        </div>
        <Drawer variant="persistent" anchor="left" open={isDrawingOpen} PaperProps={{ style: { maxWidth: 280 } }}>
          <div className="content">
            <IconButton
              onClick={() =>
                this.setState({ isDrawingOpen: !this.state.isDrawingOpen })
              }
            >
              <ChevronRight />
            </IconButton>
            <Divider />
            <List>
              <ListItem>
                <Grid container spacing={8} alignItems="flex-end">
                  <Grid item>
                    <Search />
                  </Grid>
                  <Grid item>
                    <TextField label="Search" />
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <FormControl fullWidth>
                  <InputLabel>Filter by Level</InputLabel>
                  <Select
                    onChange={this.onLevelChange}
                    value={filters.level}
                    label="Filter by level"
                  >
                    {levels.map(level => (
                      <MenuItem value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>Lorem ipsum dolor sit amet.</ListItem>
              <ListItem>Lorem ipsum dolor sit amet.</ListItem>
              <div className="test">
                {this.state.content.map((contentEntry, index) => index < 10 ?
                  <ListItem className="event" button data-event={`{ "title" : "${contentEntry.name}", "duration" : "01:00:00"}`}>
                    <Avatar src={`https://nfoo-server.com/ConnectedFitnessLabs/${contentEntry.file_name.substr(0, contentEntry.file_name.length - 4)}Square.jpg`} />
                    <ListItemText>
                      {contentEntry.name}
                    </ListItemText>
                  </ListItem> : null)
                }
              </div>
            </List>
          </div>
          <SelectTypeDialog
            show={isTypeDialogOpen}
            selectType={this.selectType}
          />
        </Drawer>
        <Popper
          anchorEl={selectedEvent}
          open={Boolean(selectedEvent)}
          placement="right"
          style={{ zIndex: 2, marginLeft: 4 }}
          transition
        >
          {({ TransitionProps }) =>
            <Grow {...TransitionProps}>
              <Card style={{ width: 250 }}>
                <CardContent>
                  <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Esse, hic.</p>
                  {type == 'advanced' &&
                    <FormControlLabel control={
                      <Switch checked={selectedEventDetails.day_of_week ? true : false} onChange={this.toggleRecurring} />}
                      label="Recurring event"
                    />
                  }
                </CardContent>
                <CardActions>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grow>
          }
        </Popper>
      </div >
    );
  }
}

export default App;
