import React, { Component } from "react";
import axios from "./axios";
import "./App.css";
import "./Calendar.css";
import "fullcalendar/dist/fullcalendar.min.css";
import { Calendar, moment } from "fullcalendar";
import {
  ListItem,
  IconButton,
  Toolbar,
  AppBar,
  Tooltip,
  Select,
  MenuItem,
  ListItemText,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  Popover
} from "@material-ui/core";
import {
  Layers,
  Cloud,
  Delete,
  ZoomIn,
  ZoomOut,
  Event
} from "@material-ui/icons";
import IconMenu from "@material-ui/icons/Menu";
import SelectTypeDialog from "./components/SelectTypeDialog/SelectTypeDialog";
import CalendarDialog from "./components/CalendarDialog/CalendarDialog";
import LeftDrawer from "./components/LeftDrawer/LeftDrawer";

class App extends Component {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
    this.zoom = 2;
    this.state = {
      isDrawerOpen: true,
      isTypeDialogOpen: false,
      isCalendarDialogOpen: false,
      selectedEvent: null,
      selectedEventDetails: { duration: "", level: "", category: "" },
      selectedCalendar: 41,
      calendars: [
        { name: "Les Mills Schedule", id: 41 },
        { name: "Zumba schedule", id: 42 }
      ],
      type: "simple",
      view: "agendaWeek",
      showEventType: 0
    };
  }

  async componentDidMount() {
    const self = this;
    this.options = {
      events: (start, end, _, callback) =>
        this.fetchData(start, end, _, callback),
      defaultView: "agendaWeek",
      allDaySlot: false,
      editable: true,
      header: false,
      columnFormat: "ddd",
      firstDay: 1,
      minTime: "03:00:00",
      maxTime: "21:00:00",
      slotDuration: "00:10:00",
      height: "parent",
      droppable: true,
      viewChange: function() {
        this.calendar.rerenderEvents();
      },
      eventReceive: event => this.eventReceive(event),
      eventClick: function(event) {
        self.eventClick(this, event);
      },
      eventResize: function() {
        self.setState({ selectedEvent: null });
      },
      eventRender: (event, element) => this.eventRender(event, element)
    };
    this.options.eventClick.bind(this);
    this.calendar = new Calendar(this.refCalendar.current, this.options);
    this.calendar.render();
    this.addScrollListener();
  }

  eventClick(element, event) {
    console.log(element, event);
    this.setState({ selectedEvent: element, selectedEventDetails: event });
  }

  addScrollListener = () => {
    //
  };

  eventRender = (event, element) => {
    element.style.backgroundImage = `url(${event.img})`;
    element.style.backgroundSize = `cover`;
    element.style.backgroundRepeat = `no-repeat`;
  };

  eventReceive = async event => {
    console.log(event);
    let day_of_week = 0;
    event.img = `https://nfoo-server.com/wexerpreview/${
      event.sf_masterid
    }_${event.navn.substr(0, event.navn.length - 4)}Square.jpg`;
    day_of_week = event.start.isoWeekday();

    const payload = {
      start: this.formatDate(event.start),
      end: this.formatDate(event.end),
      video_id: event.video_id
    };
    const id = await axios.post(
      `/v2/event?day_of_week=${day_of_week}`,
      payload
    );
    event.id = id.data;
    const duration = moment(0)
      .hours(0)
      .add(Math.abs(event.start.diff(event.end, "seconds")), "seconds")
      .format("HH:mm:ss");
    event.duration = duration;
    this.calendar.updateEvent(event);
  };

  fetchData = async (start, end, _, callback) => {
    console.log(
      `fetching data for time period ${start.format()} - ${end.format()}`
    );
    const response = await axios.get("/v2/event");

    const hello_empty = [];
    response.data.result.forEach(event => {
      console.log("event", event);
      if (event.day_of_week) {
        /* Clone view start */
        for (let i = start.clone(); i.isSameOrBefore(end); i.add("days", 8)) {
          const eventStart = i.clone();

          const eventStartMoment = moment(event.start);

          eventStart.isoWeekday(event.day_of_week);
          const duration = moment(event.end).diff(moment(event.start));

          eventStart.hours(eventStartMoment.hours());
          eventStart.minutes(eventStartMoment.minutes());
          eventStart.seconds(eventStartMoment.seconds());

          const eventEnd = eventStart.clone();
          eventEnd.add(duration);

          const newEvent = {
            id: event.id,
            start: eventStart,
            end: eventEnd,
            title: event.title,
            day_of_week: event.day_of_week,
            img: `https://nfoo-server.com/wexerpreview/${
              event.sf_masterid
            }_${event.navn.substr(0, event.navn.length - 4)}Square.jpg`,
            duration: event.sf_varighed,
            level: event.sf_level,
            category: event.sf_kategori
          };

          if (
            event.exceptions.length == 0 ||
            event.exceptions.filter(
              exp => exp.start === this.formatDate(eventStart)
            ).length == 0
          ) {
            hello_empty.push(newEvent);
          }
        }
      } else {
        hello_empty.push(event);
      }
    });
    /*
    const print = hello_empty.map(h => ({
      start: h.start.format(),
      day_of_week: h.day_of_week
    }));
    console.table(print);
    */
    callback(hello_empty);
  };

  formatDate = moment => {
    return moment.format("YYYY-MM-DD HH:mm:ss");
  };

  selectType = type => {
    type = "simple";
    if (type == "simple") {
      this.calendar.option("header", false);
      this.calendar.option("columnFormat", "ddd");
    } else {
      this.calendar.option("header", {
        left: "title",
        right: "today prev,next"
      });
      this.calendar.option("columnFormat", "ddd M/D");
    }
    this.addScrollListener();
    this.setState({ type, isTypeDialogOpen: false });
  };

  toggleRecurring = event => {
    const { selectedEventDetails } = this.state;
    if (selectedEventDetails.day_of_week == null) {
      selectedEventDetails.day_of_week = 1;
    } else {
      selectedEventDetails.day_of_week = null;
    }
    this.setState({ selectedEventDetails });
  };

  onEventDelete = () => {
    axios.delete(`/v2/event/${this.state.selectedEventDetails.id}`);
    this.calendar.removeEvents(this.state.selectedEventDetails._id);
    this.setState({ selectedEvent: null });
  };

  viewChangeHandler = event => {
    this.setState({ view: event.target.value });
    this.calendar.changeView(event.target.value);
  };

  zoomHandler = direction => {
    if (direction == "in" && this.zoom > 0) {
      this.zoom--;
    } else if (direction == "out" && this.zoom < 5) {
      this.zoom++;
    }
    switch (this.zoom) {
      case 0:
        this.calendar.option("slotDuration", "00:01:00");
        break;
      case 1:
        this.calendar.option("slotDuration", "00:05:00");
        break;
      case 2:
        this.calendar.option("slotDuration", "00:10:00");
        break;
      case 3:
        this.calendar.option("slotDuration", "00:30:00");
        break;
      default:
        this.calendar.option("slotDuration", "01:00:00");
        break;
    }
  };

  changeCalendarHandler = event => {
    if (event.target.value == 0) {
      this.toggleCalendarDialog();
    }
    this.setState({ selectedCalendar: event.target.value });
  };

  toggleCalendarDialog = () => {
    const { isCalendarDialogOpen, calendars } = this.state;
    if (isCalendarDialogOpen && calendars.length > 0) {
      this.setState({ selectedCalendar: calendars[0].id });
    }
    this.setState({ isCalendarDialogOpen: !isCalendarDialogOpen });
  };

  addCalendar = name => {
    const { calendars } = this.state;
    calendars.push({
      id: Math.floor(Math.random() * Math.floor(100)),
      name
    });
    this.toggleCalendarDialog();
    this.setState({ calendars });
  };

  toggleDrawerHandler = () => {
    const { isDrawerOpen } = this.state;
    this.setState({ isDrawerOpen: !isDrawerOpen });
  };

  render() {
    const {
      isDrawerOpen,
      isTypeDialogOpen,
      selectedEvent,
      selectedEventDetails,
      type,
      view,
      selectedCalendar,
      isCalendarDialogOpen
    } = this.state;

    return (
      <div className="App">
        <div
          className="calendar-container"
          style={{ marginLeft: isDrawerOpen ? "var(--calendarGutter)" : 30 }}
        >
          <AppBar
            position="static"
            style={{ boxShadow: "none", marginBottom: 5 }}
            color="inherit"
          >
            <Toolbar>
              {!isDrawerOpen && (
                <IconButton
                  color="inherit"
                  onClick={this.toggleDrawerHandler}
                  style={{ marginRight: 10 }}
                >
                  <IconMenu />
                </IconButton>
              )}
              <div className="calendar-picker-div">
                <Tooltip title="Les Mills Player">
                  <Event style={{ marginRight: 5 }} />
                </Tooltip>
                <Select
                  disableUnderline
                  value={selectedCalendar}
                  onChange={this.changeCalendarHandler}
                >
                  {this.state.calendars.map(calendar => (
                    <MenuItem value={calendar.id} key={`calend${calendar.id}`}>
                      {calendar.name}
                    </MenuItem>
                  ))}
                  <MenuItem value={0}>-- Add New Calendar --</MenuItem>
                </Select>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <IconButton onClick={() => this.zoomHandler("in")}>
                  <ZoomIn />
                </IconButton>
                <IconButton onClick={() => this.zoomHandler("out")}>
                  <ZoomOut />
                </IconButton>
                <Select
                  value={view}
                  onChange={this.viewChangeHandler}
                  disableUnderline
                  style={{ marginLeft: 5 }}
                >
                  <MenuItem value="agendaWeek">Week</MenuItem>
                  <MenuItem value="listWeek">List Week</MenuItem>
                  <MenuItem value="agendaDay">Day</MenuItem>
                </Select>
                <Tooltip title="Toggle simple/advanced view">
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
                    onClick={() => alert("Published changes!")}
                  >
                    <Cloud />
                  </IconButton>
                </Tooltip>
              </div>
            </Toolbar>
          </AppBar>
          <div id="calendar" ref={this.refCalendar} />
        </div>
        <LeftDrawer
          toggleDrawerHandler={this.toggleDrawerHandler}
          show={isDrawerOpen}
        />
        <Popover
          anchorEl={selectedEvent ? selectedEvent : null}
          open={Boolean(selectedEvent)}
          placement="right"
          style={{ zIndex: 2, marginLeft: 4 }}
          onClose={() => this.setState({ selectedEvent: false })}
        >
          <Card style={{ width: 300 }}>
            <CardContent>
              <p>{selectedEventDetails.title}</p>
              <p>{selectedEventDetails.duration}</p>
              <p>{selectedEventDetails.level}</p>
              {type == "advanced" && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedEventDetails.day_of_week ? true : false}
                      onChange={this.toggleRecurring}
                    />
                  }
                  label="Recurring event"
                />
              )}
            </CardContent>
            <CardActions>
              <IconButton onClick={this.onEventDelete}>
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        </Popover>
        <SelectTypeDialog
          show={isTypeDialogOpen}
          selectType={this.selectType}
        />
        <CalendarDialog
          show={isCalendarDialogOpen}
          calendars={this.state.calendars}
          toggleCalendarDialog={this.toggleCalendarDialog}
          addCalendar={this.addCalendar}
        />
      </div>
    );
  }
}

export default App;
