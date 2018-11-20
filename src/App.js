import React, { Component } from "react";
import Calendar from "./components/Calendar";
import { MuiPickersUtilsProvider } from "material-ui-pickers";
import DateFnsUtils from '@date-io/date-fns';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import './App.css'

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#8bf1da",
      main: "#53dcb6",
      dark: "#4ead91",
      contrastText: "#fff"
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000"
    }
  },
  typography: {
    useNextVariants: true,
    h4: {
      fontWeight: 900,
      textTransform: 'uppercase'
    }
  }
});

class App extends Component {

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Calendar />
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    );
  }
}

export default App;
