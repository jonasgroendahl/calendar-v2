import React, { PureComponent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  DialogActions,
  Button
} from "../../../node_modules/@material-ui/core";
import "./CalendarDialog.css";

export default class CalendarDialog extends PureComponent {
  state = {
    calendar_clone: 0,
    calendar_name: ""
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
      <Dialog open={this.props.show} onClose={this.props.toggleCalendarDialog}>
        <DialogTitle>Create a new calendar</DialogTitle>
        <DialogContent>
          <div className="calendar-dialog-forms">
            <TextField
              label="Calendar name"
              value={this.state.calendar_name}
              fullWidth
              onChange={this.onChange}
              name="calendar_name"
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Harum,
              similique!
            </p>
            <Select
              fullWidth
              value={this.state.calendar_clone}
              onChange={this.onChange}
              name="calendar_clone"
            >
              <MenuItem value={0}>None selected</MenuItem>
              {this.props.calendars.map(calendar => (
                <MenuItem value={calendar.id} key={`calendar${calendar.id}`}>
                  {calendar.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.props.addCalendar(this.state.calendar_name)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
