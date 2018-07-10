import React, { Component } from "react";
import logo from "./logo.svg";
import axios from "axios";
import "./App.css";
import "./Calendar.css";
import "fullcalendar/dist/fullcalendar.min.css";
const FullCalendar = require("fullcalendar");

class App extends Component {
  constructor(props) {
    super(props);
    this.refCalendar = React.createRef();
    this.calendar = null;
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
      firstDay: 1
    };
    this.calendar = new FullCalendar.Calendar(
      this.refCalendar.current,
      options
    );
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
      console.log(event);
      let color = "";
      switch (event.sf_kategori) {
        case "Cycling (Cycling)":
          color = "#0091EA";
          break;
        default:
          color = "#ff9800";
      }
      console.log(color);
      return {
        ...event,
        start: event.startdate,
        end: event.enddate,
        color
      };
    });
    callback(mappedData);
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <br />
        <div className="calendar-container">
          <div id="calendar" ref={this.refCalendar} />
        </div>
      </div>
    );
  }
}

export default App;
