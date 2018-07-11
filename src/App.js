import React, { Component } from "react";
import logo from "./logo.svg";
import axios from "axios";
import "./App.css";
import "./Calendar.css";
import "fullcalendar/dist/fullcalendar.min.css";
import { Calendar } from "fullcalendar";
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
  InputLabel
} from "@material-ui/core";
import { ChevronRight, Layers, Search, Cloud } from "@material-ui/icons";
import IconMenu from "@material-ui/icons/Menu";
import SelectTypeDialog from "./components/SelectTypeDialog/SelectTypeDialog";

class App extends Component {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
    this.state = {
      isDrawingOpen: true,
      isTypeDialogOpen: true,
      levels: ["None", "Beginner", "Advanced", "For everyone", "Intermediate"],
      filters: {
        level: "None"
      }
    };
  }

  componentDidMount() {
    const options = {
      events: (start, end, timezone, callback) =>
        this.fetchData(start, end, timezone, callback),
      defaultView: "agendaWeek",
      allDaySlot: false,
      editable: true,
      header: false,
      columnFormat: "dddd",
      firstDay: 1,
      slotDuration: "00:05:00",
      height: "parent"
    };
    this.calendar = new Calendar(this.refCalendar.current, options);
    this.calendar.render();
  }

  fetchData = async (start, end, timezone, callback) => {
    const startdate = start.format("YYYY-MM-DD");
    const enddate = end.format("YYYY-MM-DD");
    console.log("startdate", startdate, "enddate", enddate);
    const response = await axios.post(
      `https://api-wexer.herokuapp.com/v1/calendars/7364?start=${startdate}&end=${enddate}`
    );
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
        start: event.startdate,
        end: event.enddate,
        color
      };
    });
    callback(mappedData);
  };

  selectType = type => {
    this.setState({ type, isTypeDialogOpen: false });
  };

  onLevelChange = event => {
    const { filters } = this.state;
    filters.level = event.target.value;
    this.setState({ filters });
  };

  render() {
    const { isDrawingOpen, isTypeDialogOpen, levels, filters } = this.state;

    return (
      <div className="App">
        <div
          className="calendar-container"
          style={{ marginLeft: isDrawingOpen ? "var(--calendarGutter)" : 30 }}
        >
          <AppBar
            position="static"
            style={{ boxShadow: "none", marginBottom: 5 }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                onClick={() =>
                  this.setState({ isDrawingOpen: !this.state.isDrawingOpen })
                }
              >
                <IconMenu />
              </IconButton>
              <div style={{ marginLeft: "auto" }}>
                <Tooltip
                  title="Toggle simple/advanced view"
                  style={{ fontSize: 16 }}
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
        <Drawer variant="persistent" anchor="left" open={isDrawingOpen}>
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
            </List>
          </div>
          <SelectTypeDialog
            show={isTypeDialogOpen}
            selectType={this.selectType}
          />
        </Drawer>
      </div>
    );
  }
}

export default App;
