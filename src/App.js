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
  Title
} from "@material-ui/icons";
import IconMenu from "@material-ui/icons/Menu";
import SelectTypeDialog from "./components/SelectTypeDialog/SelectTypeDialog";
import CalendarDialog from "./components/CalendarDialog/CalendarDialog";
import LeftDrawer from "./components/LeftDrawer/LeftDrawer";
import SettingsDialog from "./components/SettingsDialog/SettingsDialog";

class App extends PureComponent {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
    this.zoom = 2;
    this.state = {
      isDrawerOpen: true,
      isTypeDialogOpen: false,
      isCalendarDialogOpen: false,
      isSettingsDialogOpen: false,
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
      viewChange: function() {
        this.calendar.rerenderEvents();
      },
      eventReceive: this.eventReceive,
      eventClick: function(event) {
        self.eventClick(this, event);
      },
      eventResize: function() {
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
    this.calendar.updateEvent(event);
  };

  fetchData = async (start, end, _, callback) => {
    const response = await axios.get("/v2/event");

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
            category: event.sf_kategori
          };

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
    console.log(events);
    /*
    const print = hello_empty.map(h => ({
      start: h.start.format(),
      day_of_week: h.day_of_week
    }));
    console.table(print);
    */
    callback(events);
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
      isCalendarDialogOpen
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
                <Tooltip title={attachedPlayerName}>
                  <div style={{ marginRight: 5 }}>{attachedPlayer}</div>
                </Tooltip>
                <Menu
                  anchorEl={this.state.selectPlayerEl}
                  open={Boolean(this.state.selectPlayerEl)}
                  onClose={this.toggleSelectPlayer}
                >
                  {this.state.players.map(player => (
                    <MenuItem onClick={() => this.selectPlayer(player.id)}>
                      {player.name}
                    </MenuItem>
                  ))}
                </Menu>
                <FormControl>
                  <InputLabel htmlFor="calendar-picker">
                    Choose a calendar
                  </InputLabel>
                  <Select
                    disableUnderline
                    value={selectedCalendar}
                    onChange={this.changeCalendarHandler}
                    input={<Input name="calendar" id="calendar-picker" />}
                  >
                    {this.state.calendars.map(calendar => (
                      <MenuItem
                        value={calendar.id}
                        key={`calend${calendar.id}`}
                      >
                        {calendar.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={this.toggleCalendarDialog}>
                  <Add />
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
                <Select
                  value={view}
                  onChange={this.viewChangeHandler}
                  disableUnderline
                  style={{ marginLeft: 5 }}
                >
                  <MenuItem value="agendaWeek">Week</MenuItem>
                  <MenuItem value="agendaDay">Day</MenuItem>
                </Select>
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
      </div>
    );
  }
}

export default App;
