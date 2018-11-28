import React, { PureComponent } from "react";
import axios from "../utils/api";
import "fullcalendar/dist/fullcalendar.min.css";
import { Calendar } from "fullcalendar";
import { IconButton, Snackbar, CircularProgress } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import LoadingModal from "./Loading/Loading";
import Log from "./LogComponent/Log";
import styled from "styled-components";
import { format, addSeconds, getDay, setDay, differenceInSeconds } from "date-fns";
import WebAPI from "../utils/WebAPI";
import { getLanguage } from "../utils/functions"
import XlsExport from 'xlsexport';
import Loadable from "react-loadable";

const LeftDrawer = Loadable({
  loader: () => import('./LeftDrawer/LeftDrawer'),
  loading: () => <CircularProgress />
});

const SelectTypeDialog = Loadable({
  loader: () => import('./SelectTypeDialog/SelectTypeDialog'),
  loading: () => <CircularProgress />
});

const CalendarDialog = Loadable({
  loader: () => import('./CalendarDialog/CalendarDialog'),
  loading: () => <CircularProgress />
})

const ActionList = Loadable({
  loader: () => import('./ActionList/ActionList'),
  loading: () => <CircularProgress />
})

const SettingsDialog = Loadable({
  loader: () => import('./SettingsDialog/SettingsDialog'),
  loading: () => <CircularProgress />
})

const EventPopover = Loadable({
  loader: () => import('./EventPopover/EventPopover'),
  loading: () => <CircularProgress />
})

const CalendarTopBar = Loadable({
  loader: () => import("./CalendarTopBar/CalendarTopBar"),
  loading: () => <CircularProgress />
})

const CalendarContainer = styled.div`
  height: calc(100vh - 80px);
  margin-left: 300px;
  transition: margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;

  padding: 0 20px;

  @media (max-width: 600px) {
    margin-left: 0 !important;
    height: auto;
    min-height: 100vh;
  }
`;

const CalendarDiv = styled.div`
  .fc-event {
    padding: 3px;
    background: black;
    border-color: black;
  }

  .fc-event .fc-bg {
    opacity: 0;
  }

  .fc-title {
    background: black;
    width: fit-content;
    font-size: 10px;
  }

  .fc-event .fc-time {
    background: cornflowerblue;
    width: fit-content;
    font-size: 10px;
  }
`;

class CalendarComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
    this.zoom = 2;
    this.state = {
      isDrawerOpen: true,
      isTypeDialogOpen: false,
      isCalendarDialogOpen: false,
      isOpen: false,
      isLogOpen: false,
      isReplacing: false,
      selectedEvent: null,
      selectedEventDetails: {
        extendedProps: {
          duration: 0
        },
        title: ""
      },
      content: [],
      selectedCalendar: 41,
      calendars: [
        { name: "Les Mills Schedule", id: 41 }
      ],
      rules: [],
      players: [{ name: "Les Mills Player", id: 43, calendar_id: 41 }],
      type: "simple",
      view: "agendaWeek",
      showEventType: 0,
      aIndex: 0,
      loading: false,
      calendarLoading: false,
      log: [],
      logId: 0,
      actions: [],
      settings: {
        firstDay: '0',
        slotLabelFormat: 'ampm'
      },
      gymId: 3163,
      iframe: false
    };
  }

  async componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);

    if (queryParams.get('iframe')) {
      await this.setState({ iframe: true });
    }

    const result = await WebAPI.getCalendars(this.state.gymId);
    const calendars = result.data.map(calendar => ({ id: calendar.gruppeid, name: calendar.navn }));
    await this.setState({ calendars, selectedCalendar: calendars.length > 0 ? calendars[0].id : 41 });
    this.createCalendar();
    const content = await axios.get("/v2/content");
    const mappedContent = content.data.map(c => ({ ...c, language: getLanguage(c) }));
    this.setState({ content: mappedContent });
    window.addEventListener("keydown", this.deleteKeybind);

  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.deleteKeybind);
  }

  deleteKeybind = event => {
    if (event.keyCode === 46 && this.eventFocused) {

      this.calendar.getEventById(this.eventFocused.id).remove();
      if (this.eventFocused.id) {
        axios.delete(`/v2/event/${this.eventFocused.id}`);
      }
      this.eventFocused = null;
      this.addCurrentEventsToActions();
    }
  };

  onEventDelete = () => {
    axios.delete(`/v2/event/${this.state.selectedEventDetails.id}`);
    const event = this.calendar.getEventById(
      this.state.selectedEventDetails.id
    );
    event.remove();
    this.addToLog("Delete", this.state.selectedEventDetails);
    this.setState({ selectedEvent: null });
    this.addCurrentEventsToActions();
  };

  handleClosePopover = () => {
    this.setState({ selectedEvent: false });
  }

  createCalendar = () => {

    if (this.calendar) {
      this.calendar.destroy();
      this.state.actions.splice(0, this.state.actions.length);
      this.setState({ aIndex: 0 });
    }
    this.setState({ calendarLoading: true });

    const { settings } = this.state;

    const firstDay = this.applySettingsOnCalendar(settings.firstDay);
    const slotLabelFormat = this.applySettingsOnCalendar(settings.slotLabelFormat);


    this.options = {
      events: this.fetchData,
      defaultView: "agendaWeek",
      allDaySlot: false,
      header: false,
      columnHeaderFormat: {
        weekday: "short"
      },
      slotLabelFormat: slotLabelFormat,
      firstDay: firstDay,
      minTime: "08:00:00",
      maxTime: "24:00:00",
      slotDuration: "00:10:00",
      snapDuration: "00:01:00",
      height: "parent",
      droppable: true,
      eventOverlap: this.eventOverlap,
      eventStartEditable: true, // BUGGED, cant change it
      eventMouseEnter: this.eventMouseEnter,
      viewChange: function () {
        this.calendar.rerenderEvents();
      },
      eventClick: this.eventClick,
      eventRender: this.eventRender,
      eventDrop: this.eventDrop,
      drop: this.drop,
      dayClick: this.dayClick
    };

    console.log(this.refCalendar.current);
    this.calendar = new Calendar(this.refCalendar.current, this.options);
    this.calendar.render();
  };

  eventOverlap = (stillEvent, movingEvent) => {
    if (stillEvent.rendering !== 'background') {
      return false;
    }
    return true;
  }

  eventMouseEnter = ({ event }) => {
    if (!this.eventFocused || this.eventFocused.id !== event.id) {
      this.eventFocused = event;
    }
  };

  eventDrop = async ({ event, revert, jsEvent }) => {
    if (!jsEvent.shiftKey) {
      axios.put(`/v2/event_mw/${event.id ? event.id : event.def.id}`, {
        start: format(event.start, "HH:mm:ss"),
        day_of_week: getDay(event.start)
      });
      this.addToLog("Move", event);
    } else {

      revert();
      const obj = {
        start: event.start,
        end: event.end,
        title: event.title,
        extendedProps: { ...event.extendedProps }
      };

      const payload = {
        start: format(event.start, "HH:mm:ss"),
        video_id: event.extendedProps.video_id,
        day_of_week: getDay(event.start),
        calendar_id: this.state.selectedCalendar
      };

      const { data } = await axios.post(`/v2/events`, payload);
      obj.id = data;
      this.calendar.addEvent(obj);
      this.addToLog("Shift key copied", event);
    }
    this.addCurrentEventsToActions();
  };

  dayClick = event => {

  };

  eventClick = ({ el, event }) => {
    if (event.rendering !== 'background' && !this.state.iframe) {
      this.setState({ selectedEvent: el, selectedEventDetails: event });
    }
  };

  eventRender = ({ event, el }) => {
    if (event.def.extendedProps.sf_masterid) {
      const img = `https://nfoo-server.com/wexerpreview/${
        event.def.extendedProps.sf_masterid
        }_${event.def.extendedProps.navn.substr(
          0,
          event.def.extendedProps.navn.length - 4
        )}Square.jpg`;
      if (event.def.extendedProps.video_id !== 9999) {
        el.style.backgroundImage = `url(${img})`;
        el.style.backgroundSize = `cover`;
        el.style.backgroundRepeat = `no-repeat`;
      }
    }
  };

  drop = async ({ date, draggedEl }) => {

    const properties = JSON.parse(draggedEl.dataset.event);

    // Avoid overlap
    const events = this.calendar.getEvents();
    const dateEnd = addSeconds(date, properties.sf_varighedsec);

    for (let e of events) {
      if (((e.start < date && dateEnd < e.end) || (dateEnd > e.start && e.start > date) || (date < e.end && e.end <= dateEnd)) && e.rendering !== 'background') {
        return;
      }
    }
    const payload = this.formatEventForDB(date, properties.video_id);
    const { data } = await axios.post(`/v2/events`, payload);

    const event = this.createEvent({ id: data, start: date, extendedProps: properties });
    this.addToLog("Add", event);
    this.calendar.addEvent(event);
    this.addCurrentEventsToActions();

  };

  formatEventForDB = (date, video_id) => {
    return {
      start: format(date, "HH:mm:ss"),
      video_id: video_id,
      day_of_week: getDay(date),
      calendar_id: this.state.selectedCalendar
    }
  }

  fetchData = async ({ start }, callback) => {
    const { data } = await WebAPI.getCalendarEvents(this.state.selectedCalendar);

    const rules = [];
    const events = data.reduce((acc, event) => {
      const isARule = event.indslagid === 9999;
      start.setMinutes(event.start.substr(3, 2));
      start.setHours(event.start.substr(0, 2));
      const startSetDay = setDay(start, event.day_of_week);
      const endTime = addSeconds(startSetDay, !isARule ? event.sf_varighedsec : event.duration);
      const end = format(endTime, "HH:mm");
      const el = {
        id: event.id,
        title: event.sf_engelsktitel,
        daysOfWeek: [event.day_of_week],
        startTime: event.start,
        endTime: end,
        sf_masterid: event.sf_masterid,
        navn: event.navn,
        startEditable: !this.state.iframe ? true : false,
        sf_varighedsec: event.sf_varighedsec,
        video_id: event.indslagid,
        fav: 0,
        level: event.sf_level,
        rendering: !isARule ? '' : 'background',
        language: getLanguage(event)
      };
      if (isARule) {
        rules.push({ startTime: event.start, endTime: end, id: event.id, daysOfWeek: [event.day_of_week] });
      }
      acc.push(el);
      return acc;
    }, []);

    this.setState({ calendarLoading: false, rules });
    callback(events);
    this.addCurrentEventsToActions();
  };


  createEvent = (event) => {
    const obj = {
      id: event.id,
      title: event.title,
      startTime: format(event.start, 'HH:mm'),
      endTime: event.end ? format(event.end, 'HH:mm') : format(addSeconds(event.start, event.extendedProps.sf_varighedsec), 'HH:mm'),
      daysOfWeek: [event.daysOfWeek !== undefined ? event.daysOfWeek : getDay(event.start)],
      startEditable: true,
      rendering: event.extendedProps.video_id === 9999 ? 'background' : '',
      ...event.extendedProps
    }
    return obj;
  }

  selectType = type => {
    if (type === "simple") {
      this.calendar.setOption("header", false);
      this.calendar.setOption("columnHeaderFormat", { weekday: "short" });
    } else {
      this.calendar.setOption("header", {
        left: "title",
        right: "today prev,next"
      });
      this.calendar.setOption("columnHeaderFormat", {});
    }
    this.setState({ type, isTypeDialogOpen: false });
  };

  changeRecurringPattern = event => {
    const { selectedEventDetails } = this.state;
    selectedEventDetails.seperation_count = event.target.value;
    this.calendar.updateEvent(selectedEventDetails);
    this.setState({ selectedEventDetails });
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
        this.calendar.setOption("slotDuration", "00:01:00");
        break;
      case 1:
        this.calendar.setOption("slotDuration", "00:05:00");
        break;
      case 2:
        this.calendar.setOption("slotDuration", "00:10:00");
        break;
      case 3:
        this.calendar.setOption("slotDuration", "00:30:00");
        break;
      default:
        this.calendar.setOption("slotDuration", "01:00:00");
        break;
    }
  };

  changeCalendarHandler = id => {
    this.setState({ selectedCalendar: id }, () => this.createCalendar());
  };

  toggleCalendarDialog = () => {
    const { isCalendarDialogOpen } = this.state;
    this.setState({ isCalendarDialogOpen: !isCalendarDialogOpen });
  };

  addCalendar = async (name, cloneId) => {

    const { calendars } = this.state;
    const { data } = await WebAPI.addCalendar({ navn: name, kundeid: this.state.gymId });
    if (cloneId) {
      await WebAPI.cloneCalendar(data, { id: cloneId });
    }
    calendars.push({ id: data, name });
    this.toggleCalendarDialog();
    this.setState({ calendars, selectedCalendar: data }, () => this.createCalendar());
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
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  };


  toggleActionList = (e) => {
    this.setState({ anchorMoreBtn: e ? e.target : null });
  }

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

  redoHandler = () => {
    this.addToLog("Redo");
    const aIndex = this.state.aIndex + 1;

    this.recoverState(aIndex);
    this.setState({ aIndex });
  };

  undoHandler = () => {
    this.addToLog("Undo");
    const aIndex = this.state.aIndex - 1;

    this.recoverState(aIndex);
    this.setState({ aIndex });
  };

  addCurrentEventsToActions = () => {
    const events = this.calendar.getEvents();
    const actions = [...this.state.actions];
    actions.push(events);
    this.setState({ aIndex: actions.length - 1, actions });
  };

  deleteAllEvents = () => {
    this.calendar.batchRendering(() => {
      const events = this.calendar.getEvents();
      events.forEach(event => this.calendar.getEventById(event.id).remove());
    });
  };

  recoverState = index => {
    this.compareArrs(index);
    this.calendar.batchRendering(() => {
      const events = this.calendar.getEvents();
      events.forEach(event => this.calendar.getEventById(event.id).remove());
      this.state.actions[index].forEach(event => this.calendar.addEvent(this.createEvent(event)));
    });
  };


  compareArrs = async (index) => {

    this.setState({ loading: true });
    const x = this.calendar.getEvents();
    const y = this.state.actions[index];

    const opts = {
      add: [],
      delete: [],
      update: []
    }

    const ids = [];

    x.forEach(f => {
      // Look for updates
      let update;
      for (let s of y) {
        if (s.id === f.id && (JSON.stringify(s.start) !== JSON.stringify(f.start) || s.extendedProps.video_id !== f.extendedProps.video_id)) {
          update = s;
          break;
        }
      }

      if (update) {
        opts.update.push(update);
      }
      else if (y.every(s => s.id !== f.id)) {
        opts.delete.push(f);
      }
      ids.push(f.id);
    })

    const addRemaining = y.filter(p => ids.indexOf(p.id) === -1);
    opts.add.push(...addRemaining);

    await WebAPI.updateMultipleEvents({
      remove: opts.delete.map(event => event.id),
      add: opts.add.map(event => ({ id: event.id, ...this.formatEventForDB(event.start, event.extendedProps.video_id) })),
      update: opts.update.map(event => ({ id: event.id, ...this.formatEventForDB(event.start, event.extendedProps.video_id) }))
    });

    console.log("compareArrs",opts);
    this.setState({ loading: false });
    return opts;
  }

  deleteAllHandler = () => {
    const confirm = window.confirm('Are you sure?');
    if (confirm) {
      this.deleteAllEvents();
      this.state.actions.push([]);
      this.setState({ aIndex: this.state.actions.length - 1 });
      this.toggleActionList(null);
      WebAPI.deleteAllEvents(this.state.selectedCalendar);
    }
  };

  copyOneDayHandler = async (start, endObj) => {
    const end = Object.keys(endObj).reduce((a, c) => {
      if (endObj[c]) { a.push(parseInt(c, 10)) };
      return a;
    }, []);

    const deleteIds = [];
    this.calendar.batchRendering(() => {
      this.calendar
        .getEvents()
        .forEach(event => {
          if (end.indexOf(event.def.recurringDef.typeData.daysOfWeek[0]) !== -1) {
            deleteIds.push(event.id);
            event.remove();
          }
        }
        );
    });
    if (deleteIds.length > 0) {
      await WebAPI.updateMultipleEvents({ remove: deleteIds });
    }

    const events = this.calendar
      .getEvents()
      .filter(event => event.def.recurringDef.typeData.daysOfWeek[0] == start);

    const eventsToAdd = [];

    end.forEach(end => {
      events.forEach(event => {
        const newEvent = this.createEvent({
          start: event.start,
          title: event.title,
          extendedProps: event.extendedProps,
          daysOfWeek: end
        });
        eventsToAdd.push(newEvent);
      });
    })

    const mapped = eventsToAdd.map(event => ({
      start: event.startTime + ":00",
      video_id: event.video_id,
      day_of_week: event.daysOfWeek[0],
      calendar_id: this.state.selectedCalendar
    }));
    const insertId = await WebAPI.updateMultipleEvents({ add: mapped });
    this.calendar.batchRendering(() => {
      eventsToAdd.forEach((event, index) => {
        this.calendar.addEvent({ ...event, id: index + insertId.data });
      });
    });

    this.addCurrentEventsToActions();
    this.toggleActionList(null);
  };

  toggleIsReplacing = () => {
    this.setState({ isReplacing: !this.state.isReplacing });
    this.toggleActionList(null);
  };

  replaceClassHandler = async (fromId, eventTo) => {

    const events = this.calendar
      .getEvents()
      .filter(event => event.extendedProps.video_id === fromId);

    let update = [];
    this.calendar.batchRendering(() => {
      events.forEach(event => {
        event.setProp("title", eventTo.sf_engelsktitel);
        event.setEnd(addSeconds(event.start, eventTo.sf_varighedsec));
        event.setExtendedProp("video_id", eventTo.video_id ? eventTo.video_id : eventTo.indslagid);
        event.setExtendedProp("sf_masterid", eventTo.sf_masterid);
        event.setExtendedProp("navn", eventTo.navn);
        update.push({ id: event.id, ...this.formatEventForDB(event.start, eventTo.video_id ? eventTo.video_id : eventTo.indslagid) });
      });
    });

    await WebAPI.updateMultipleEvents({ update });
    this.addCurrentEventsToActions();
  };

  calculateEndDate = (start, end) => {
    const startD = new Date();
    const endD = new Date();

    startD.setHours(start.substr(0, 2));
    startD.setMinutes(start.substr(3, 2));

    endD.setHours(end.substr(0, 2));
    endD.setMinutes(end.substr(3, 2));

    const diff = differenceInSeconds(endD, startD);

    return diff;
  }

  addRule = async (day, start, end) => {
    const duration = this.calculateEndDate(start, end);

    const { data } = await WebAPI.addEvent({
      start,
      video_id: 9999,
      calendar_id: this.state.selectedCalendar,
      day_of_week: day,
      duration
    });
    const event = {
      title: "",
      startTime: start,
      endTime: end,
      daysOfWeek: [day],
      rendering: "background",
      id: data
    };

    const rules = [...this.state.rules, { ...event }];
    this.setState({ rules });
    this.calendar.addEvent(event);
  };


  deleteRule = async (ruleIndex) => {
    const { rules } = this.state;
    const id = rules[ruleIndex].id;
    const newRulesArray = rules.filter((_, index) => index !== ruleIndex);
    this.calendar.getEventById(id).remove();
    await WebAPI.deleteEvent(id);

    this.setState({ rules: newRulesArray });
  };

  addToLog = async (message, event) => {
    const msg = {
      message,
      date: format(new Date(), "YYYY-MM-dd HH:mm:ss"),
      id: event ? event.id : "--",
      video_id: event ? event.video_id : "--",
      start: event ? format(event.start, "YYYY-MM-dd HH:mm:ss") : "--"
    };
    const log = [...this.state.log, msg];
    if (!this.state.logId) {
      const result = await axios.post(`/v2/event/logs`, log);
      this.setState({ logId: result.data });
    } else {
      axios.put(`/v2/event/logs/${this.state.logId}`, log);
    }
    this.setState({ log });
  };

  toggleLog = () => {
    this.toggleActionList(null);
    this.setState({ isLogOpen: !this.state.isLogOpen });
  };

  handleSettingChange = (name, value) => {
    this.setState(prevState => {
      const newState = { ...prevState };
      const settings = { ...newState.settings };
      settings[name] = value;
      newState.settings = settings;
      return newState;
    })
    const val = this.applySettingsOnCalendar(name, value);
    this.calendar.setOption(name, val);
  }

  applySettingsOnCalendar = (name, value) => {
    switch (name) {
      case 'slotLabelFormat':
        if (value === 'ampm') {
          return { hour: '2-digit', minute: '2-digit', hour12: true };
        }
        return { hour: '2-digit', minute: '2-digit', hour12: false };
      case 'firstDay':
        return parseInt(value, 10);
      default:
        return { hour: '2-digit', minute: '2-digit', hour12: true };
    }
  }

  addFav = () => {
    const { selectedEventDetails } = this.state;

    const events = this.calendar.getEvents().filter(e => e.extendedProps.video_id === selectedEventDetails.extendedProps.video_id);

    const event = events[0];

    const toggleState = Number(!event.extendedProps.fav);

    this.calendar.batchRendering(() => {
      for (let e of events) {
        e.setExtendedProp('fav', toggleState);
      }
    })


    const content = [...this.state.content];
    const index = content.findIndex(c => c.indslagid === event.extendedProps.video_id);
    content[index].fav = toggleState;
    this.setState({ selectedEventDetails: event, content });
  }

  exportToIframe = () => {
    window.open(window.location.href + "?iframe=1");
    this.toggleSettingsMenu();
  }

  exportToCSV = () => {
    const events = this.calendar.getEvents();

    const xls = new XlsExport(events.map(event => ({ title: event.title, start: format(event.start, 'HH:mm'), ...event.extendedProps })));
    xls.exportToCSV('export2017.csv');
    this.toggleSettingsMenu();
  }

  deleteCalendar = async (id) => {
    const confirm = window.confirm('Are you sure?');
    if (confirm) {
      await WebAPI.deleteCalendar(id);
      const calendars = this.state.calendars.filter(cl => cl.id !== id);
      this.setState({ calendars });
    }
  }

  setView = (start, end) => {

    this.calendar.batchRendering(() => {
      this.calendar.setOption("minTime", start);
      this.calendar.setOption("maxTime", end);
    })
    this.toggleSettingsMenu();
  }

  clickAway = () => {

    this.setState({ anchorMoreBtn: null });
  }


  render() {
    const {
      isDrawerOpen,
      isTypeDialogOpen,
      isOpen,
      isLogOpen,
      selectedEvent,
      selectedEventDetails,
      type,
      view,
      selectedCalendar,
      isCalendarDialogOpen,
      isReplacing,
      calendars,
      rules,
      log,
      settings,
      content,
      iframe,
      loading,
      calendarLoading,
      actions,
      aIndex
    } = this.state;

    return (
      <div className="calendar-outer-wrapper">
        {!iframe &&
          <LeftDrawer
            toggleDrawerHandler={this.toggleDrawerHandler}
            show={isDrawerOpen}
            isReplacing={isReplacing}
            replace={this.replaceClassHandler}
            toggleIsReplacing={this.toggleIsReplacing}
            calendars={calendars}
            selectedCalendar={selectedCalendar}
            toggleCalendarDialog={this.toggleCalendarDialog}
            changeCalendarHandler={this.changeCalendarHandler}
            addRule={this.addRule}
            rules={rules}
            deleteRule={this.deleteRule}
            calendar={this.calendar}
            settings={settings}
            content={content}
            deleteCalendar={this.deleteCalendar}
          />
        }
        <CalendarContainer className="calendar-container" style={{ marginLeft: isDrawerOpen && !iframe ? 300 : 0 }}>
          {!iframe && <CalendarTopBar
            isDrawerOpen={isDrawerOpen}
            aIndex={aIndex}
            loading={loading}
            actions={actions}
            view={view}
            toggleActionList={this.toggleActionList}
            toggleSettingsMenu={this.toggleSettingsMenu}
            zoomHandler={this.zoomHandler}
            redoHandler={this.redoHandler}
            undoHandler={this.undoHandler}
            toggleDrawerHandler={this.toggleDrawerHandler} />
          }
          <CalendarDiv id="calendar" innerRef={this.refCalendar} style={{ marginTop: iframe ? 20 : 0 }} />
        </CalendarContainer>

        <EventPopover
          selectedEventDetails={selectedEventDetails}
          selectedEvent={selectedEvent}
          onEventDelete={this.onEventDelete}
          addFav={this.addFav}
          handleClosePopover={this.handleClosePopover}
          type={type}
          changeRecurringPattern={this.changeRecurringPattern} />
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
          show={isOpen}
          toggleTypeDialog={this.toggleTypeDialog}
          settings={this.state.settings}
          handleSettingChange={this.handleSettingChange}
          exportToCSV={this.exportToCSV}
          exportToIframe={this.exportToIframe}
          setView={this.setView}
        />
        <ActionList
          anchorEl={this.state.anchorMoreBtn}
          delete={this.deleteAllHandler}
          copy={this.copyOneDayHandler}
          replace={this.toggleIsReplacing}
          toggleLog={this.toggleLog}
          clickAway={this.clickAway}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={isReplacing}
          message="Selection mode enabled"
          action={
            <IconButton color="inherit" onClick={this.toggleIsReplacing}>
              <Close />
            </IconButton>
          }
        />
        <LoadingModal show={calendarLoading} />
        {isLogOpen && (
          <Log log={log} show={isLogOpen} toggleLog={this.toggleLog} />
        )}
      </div>
    );
  }
}

export default CalendarComponent;
