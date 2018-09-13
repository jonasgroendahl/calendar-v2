import React, { PureComponent } from "react";
import axios from "./axios";
import "./App.css";
import "./Calendar.css";
import "fullcalendar/dist/fullcalendar.min.css";
import { Calendar, moment } from "fullcalendar";
import {
  IconButton,
  Toolbar,
  AppBar,
  Tooltip,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Popover,
  ListItem,
  List,
  ListItemText,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Input,
  Menu
} from "@material-ui/core";
import {
  Delete,
  ZoomIn,
  Power,
  PowerOff,
  Add,
  ZoomOut,
  Build,
  SignalCellular1Bar,
  SignalCellular2Bar,
  SignalCellular0Bar,
  Timer,
  Title,
  Redo,
  Undo,
  MoreVert
} from "@material-ui/icons";
import IconMenu from "@material-ui/icons/Menu";
import SelectTypeDialog from "./components/SelectTypeDialog/SelectTypeDialog";
import CalendarDialog from "./components/CalendarDialog/CalendarDialog";
import LeftDrawer from "./components/LeftDrawer/LeftDrawer";
import SettingsDialog from "./components/SettingsDialog/SettingsDialog";
import ActionDialog from "./components/ActionDialog/ActionDialog";

class App extends PureComponent {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
    this.zoom = 2;
    this.actions = [];
    this.state = {
      isDrawerOpen: true,
      isTypeDialogOpen: false,
      isCalendarDialogOpen: false,
      isSettingsDialogOpen: false,
      isActionDialogOpen: false,
      isReplacing: false,
      selectedEvent: null,
      selectedEventDetails: { duration: "", level: "", category: "" },
      selectedCalendar: 41,
      calendars: [
        { name: "Les Mills Schedule", id: 41 },
        { name: "Zumba schedule", id: 42 }
      ],
      players: [{ name: "Les Mills Player", id: 43, calendar_id: 41 }],
      type: "simple",
      view: "agendaWeek",
      showEventType: 0,
      aIndex: 0
    };
  }

  async componentDidMount() {
    const self = this;
    this.options = {
      events: (start, end, _, callback) =>
        this.fetchData(start, end, _, callback),
      defaultView: "agendaWeek",
      allDaySlot: false,
      eventDurationEditable: false,
      eventStartEditable: true,
      header: false,
      columnFormat: "ddd",
      firstDay: 1,
      minTime: "03:00:00",
      maxTime: "21:00:00",
      slotDuration: "00:10:00",
      snapDuration: "00:01:00",
      height: "parent",
      droppable: true,
      viewChange: function () {
        this.calendar.rerenderEvents();
      },
      eventReceive: this.eventReceive,
      eventClick: function (event) {
        self.eventClick(this, event);
      },
      eventResize: function () {
        self.setState({ selectedEvent: null });
      },
      eventRender: this.eventRender,
      eventDrop: this.eventMove
    };
    this.options.eventClick.bind(this);
    this.calendar = new Calendar(this.refCalendar.current, this.options);
    this.calendar.render();
  }

  eventMove = async (event, delta) => {
    const res = await axios.put(`/v2/event/${event.id}`, {
      start: this.formatDate(event.start),
      end: this.formatDate(event.end),
      day_of_week: event.start.isoWeekday()
    });
    this.actions.push(this.calendar.clientEvents());
    const { aIndex } = this.state;
    this.setState({ aIndex: aIndex + 1 });
    console.log("mooove", res);
  };

  eventClick(element, event) {
    console.log(element, event);
    this.setState({ selectedEvent: element, selectedEventDetails: event });
  }

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
    // allow on-demand block to be resized
    if (event.video_id === 9999) {
      console.log("On-Demand!");
      event.durationEditable = true;
    }
    this.calendar.updateEvent(event);
    this.addCurrentEventsToActions();
  };

  fetchData = async (start, end, _, callback) => {
    const response = await axios.get("/v2/event");
    console.log("fetchData", response);
    const events = [];
    response.data.result.forEach(event => {
      if (event.day_of_week) {
        for (let i = start.clone(); i.isSameOrBefore(end); i.add(8, "days")) {
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
            seperation_count: event.seperation_count,
            img: event.sf_masterid
              ? `https://nfoo-server.com/wexerpreview/${
              event.sf_masterid
              }_${event.navn.substr(0, event.navn.length - 4)}Square.jpg`
              : "https://historielaerer.dk/wp-content/plugins/wp-ulike/assets/img/no-thumbnail.png",
            duration: event.sf_varighed,
            level: event.sf_level,
            category: event.sf_kategori,
            video_id: event.video_id
          };

          if (newEvent.video_id === 9999) {
            newEvent.durationEditable = true;
          }

          if (
            event.exceptions.length === 0 ||
            event.exceptions.filter(
              exp => exp.start === this.formatDate(eventStart)
            ).length === 0
          ) {
            events.push(newEvent);
          }
        }
      } else {
        events.push(event);
      }
    });
    callback(events);
    this.actions.push(this.calendar.clientEvents());
  };

  formatDate = moment => {
    return moment.format("YYYY-MM-DD HH:mm:ss");
  };

  selectType = type => {
    if (type === "simple") {
      this.calendar.option("header", false);
      this.calendar.option("columnFormat", "ddd");
    } else {
      this.calendar.option("header", {
        left: "title",
        right: "today prev,next"
      });
      this.calendar.option("columnFormat", "ddd M/D");
    }
    this.setState({ type, isTypeDialogOpen: false });
  };

  changeRecurringPattern = event => {
    const { selectedEventDetails } = this.state;
    selectedEventDetails.seperation_count = event.target.value;
    this.calendar.updateEvent(selectedEventDetails);
    this.setState({ selectedEventDetails });
  };

  onEventDelete = () => {
    axios.delete(`/v2/event/${this.state.selectedEventDetails.id}`);
    this.calendar.removeEvents(this.state.selectedEventDetails._id);
    this.setState({ selectedEvent: null });
    this.addCurrentEventsToActions();
  };

  viewChangeHandler = event => {
    this.setState({ view: event.target.value });
    this.calendar.changeView(event.target.value);
  };

  zoomHandler = direction => {
    if (direction === "in" && this.zoom > 0) {
      this.zoom--;
    } else if (direction === "out" && this.zoom < 5) {
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
    this.setState({ selectedCalendar: event.target.value });
  };

  toggleCalendarDialog = () => {
    const { isCalendarDialogOpen } = this.state;
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

  toggleTypeDialog = () => {
    const { isTypeDialogOpen } = this.state;
    this.setState({ isTypeDialogOpen: !isTypeDialogOpen });
  };

  toggleDrawerHandler = () => {
    const { isDrawerOpen } = this.state;
    this.setState({ isDrawerOpen: !isDrawerOpen });
  };

  toggleSettingsMenu = () => {
    const { isSettingsDialogOpen } = this.state;
    this.setState({ isSettingsDialogOpen: !isSettingsDialogOpen });
  };

  toggleSelectPlayer = event => {
    this.setState({ selectPlayerEl: event.target });
  };

  toggleActionDialog = () => {
    this.setState({ isActionDialogOpen: !this.state.isActionDialogOpen });
  };

  selectPlayer = id => {
    const { players, selectedCalendar } = this.state;
    const player = players.find(pl => pl.id === id);
    player.calendar_id = selectedCalendar;
    this.setState({ players, selectPlayerEl: null });
  };

  deselectPlayer = () => {
    const { players, selectedCalendar } = this.state;
    const playerIndex = players.findIndex(
      pl => pl.calendar_id === selectedCalendar
    );
    const modifiedPlayerArr = [...players];
    modifiedPlayerArr[playerIndex].calendar_id = 0;
    this.setState({ players: modifiedPlayerArr });
  };

  copyHandler = () => {

  }

  redoHandler = () => {
    const { aIndex } = this.state;
    this.calendar.removeEvents();
    this.setState({ aIndex: aIndex + 1 }, () => this.calendar.addEventSource(this.actions[this.state.aIndex]));
  }

  undoHandler = () => {
    const { aIndex } = this.state;
    console.log(aIndex);
    console.log(this.actions);
    this.calendar.removeEvents();
    this.setState({ aIndex: aIndex - 1 }, () => this.calendar.addEventSource(this.actions[this.state.aIndex]));
  }

  addCurrentEventsToActions = () => {
    const events = this.calendar.clientEvents();
    this.actions.push(events);
    this.setState({ aIndex: this.actions.length - 1 });
  }

  deleteAllHandler = () => {
    const { aIndex } = this.state;
    this.calendar.removeEvents();
    this.actions.push([]);
    this.setState({ aIndex: this.actions.length - 1 });
  }

  copyOneDayHandler = (start, end) => {
    this.calendar.removeEvents(event => event.day_of_week == end);
    const events = this.calendar.clientEvents((event) => event.day_of_week == start);
    const eventsMapped = events.map(event => {
      const e = { ...event };
      e.start = e.start.isoWeekday(end);
      e.end = e.end.isoWeekday(end);
      return e;
    });
    this.calendar.addEventSource(eventsMapped);
    this.addCurrentEventsToActions();
  }

  toggleIsReplacing = () => {
    this.setState({ isReplacing: !this.state.isReplacing, isActionDialogOpen: false });
  }

  replaceClassHandler = (fromId, eventTo) => {
    const events = this.calendar.clientEvents((event) => event.video_id == fromId);
    const eventsMapped = events.map(event => {
      const e = { ...event };
      e.category = eventTo.sf_kategori;
      e.title = eventTo.sf_engelsktitel;
      e.img = `https://nfoo-server.com/wexerpreview/${
        eventTo.sf_masterid
        }_${eventTo.navn.substr(
          0,
          eventTo.navn.length - 4
        )}Square.jpg`;
      return e;
    });
    this.calendar.updateEvents(eventsMapped);
    this.addCurrentEventsToActions();
  }



  render() {
    const {
      isDrawerOpen,
      isTypeDialogOpen,
      isSettingsDialogOpen,
      selectedEvent,
      selectedEventDetails,
      type,
      view,
      selectedCalendar,
      isCalendarDialogOpen,
      isActionDialogOpen,
      isReplacing
    } = this.state;

    // <Tooltip title="Les Mills Player">
    const players = this.state.players.filter(
      player => player.calendar_id === selectedCalendar
    );
    let attachedPlayer = null;
    if (players.length > 0) {
      attachedPlayer = (
        <IconButton onClick={this.deselectPlayer}>
          <Power />
        </IconButton>
      );
    } else {
      attachedPlayer = (
        <IconButton onClick={this.toggleSelectPlayer}>
          <PowerOff />
        </IconButton>
      );
    }
    let attachedPlayerName =
      players.length > 0
        ? `Attached to the following players: ${players[0].name}`
        : "No player attached";

    return (
      <div className="App">
        <LeftDrawer
          toggleDrawerHandler={this.toggleDrawerHandler}
          show={isDrawerOpen}
          isReplacing={isReplacing}
          replace={this.replaceClassHandler}
          toggleIsReplacing={this.toggleIsReplacing}
        />
        <div
          className="calendar-container"
          style={{ marginLeft: isDrawerOpen ? "var(--calendarGutter)" : 30 }}
        >
          <AppBar
            position="static"
            style={{ boxShadow: "none", marginBottom: 5 }}
            color="inherit"
          >
            <Toolbar id="toolbar">
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
                <IconButton onClick={this.toggleCalendarDialog}>
                  <Add />
                </IconButton>
                <IconButton onClick={this.undoHandler} disabled={this.state.aIndex === 0}>
                  <Undo />
                </IconButton>
                <IconButton onClick={this.redoHandler} disabled={this.actions.length === 0 || this.state.aIndex === this.actions.length - 1}>
                  <Redo />
                </IconButton>
                <IconButton onClick={this.toggleActionDialog}>
                  <MoreVert />
                </IconButton>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Tooltip title="Settings">
                  <IconButton onClick={this.toggleSettingsMenu}>
                    <Build />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={() => this.zoomHandler("in")}>
                  <ZoomIn />
                </IconButton>
                <IconButton onClick={() => this.zoomHandler("out")}>
                  <ZoomOut />
                </IconButton>
                {false ? <Select
                  value={view}
                  onChange={this.viewChangeHandler}
                  disableUnderline
                  style={{ marginLeft: 5 }}
                >
                  <MenuItem value="agendaWeek">Week</MenuItem>
                  <MenuItem value="agendaDay">Day</MenuItem>
                </Select> : null
                }
              </div>
            </Toolbar>
          </AppBar>
          <div id="calendar" ref={this.refCalendar} />
        </div>
        <Popover
          anchorEl={selectedEvent ? selectedEvent : null}
          open={Boolean(selectedEvent)}
          placement="right"
          style={{ zIndex: 2, marginLeft: 4 }}
          onClose={() => this.setState({ selectedEvent: false })}
        >
          <Card style={{ width: 300 }}>
            <CardContent>
              <List>
                <ListItem>
                  <Avatar>
                    <Title />
                  </Avatar>
                  <ListItemText>{selectedEventDetails.title}</ListItemText>
                </ListItem>
                <ListItem>
                  <Avatar>
                    <Timer />
                  </Avatar>
                  <ListItemText
                    primary={moment(
                      `01-01-1991 ${selectedEventDetails.duration}`
                    ).format("mm:ss")}
                  />
                </ListItem>
                <ListItem>
                  <Avatar>
                    {selectedEventDetails.level === "Beginner" ? (
                      <SignalCellular1Bar />
                    ) : selectedEventDetails.level === "Intermediate" ? (
                      <SignalCellular2Bar />
                    ) : (
                          <SignalCellular0Bar />
                        )}
                  </Avatar>
                  <ListItemText primary={selectedEventDetails.level} />
                </ListItem>
              </List>
              {type === "advanced" && (
                <Select
                  disableUnderline
                  value={selectedEventDetails.seperation_count}
                  onChange={this.changeRecurringPattern}
                >
                  <MenuItem dense value={0}>
                    Doesn't repeat
                  </MenuItem>
                  <MenuItem value={1}>Repeat weekly</MenuItem>
                </Select>
              )}
            </CardContent>
            <CardActions>
              <Button onClick={this.onEventDelete} color="primary">
                <Delete style={{ marginRight: 10 }} /> Delete
              </Button>
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
        <SettingsDialog
          toggleSettingsMenu={this.toggleSettingsMenu}
          show={isSettingsDialogOpen}
          toggleTypeDialog={this.toggleTypeDialog}
        />
        <ActionDialog
          show={isActionDialogOpen}
          toggle={this.toggleActionDialog}
          delete={this.deleteAllHandler}
          copy={this.copyOneDayHandler}
          replace={this.toggleIsReplacing}
        />
      </div>
    );
  }
}

export default App;
