import React, { PureComponent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemText,
  MenuItem,
  ListItem,
  Button,
  DialogActions,
  Avatar,
  ListItemAvatar,
  ListItemIcon,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import { Assignment, Clear, FindReplace, Done, Remove } from "@material-ui/icons";

export default class ActionDialog extends PureComponent {
  state = {
    copyOneDay: {
      start: '1',
      end: {
        '2': 1
      }
    },
    replaceAll: {
      original: 0,
      new: 0
    }
  };

  handleChange = event => {
    const copyOneDay = { ...this.state.copyOneDay };
    copyOneDay[event.target.name] = event.target.value;
    this.setState({ copyOneDay });
  };

  render() {
    const { copyOneDay } = this.state;

    const days = [
      { value: 1, text: "Monday" },
      { value: 2, text: "Tuesday" },
      { value: 3, text: "Wednesday" },
      { value: 4, text: "Thursday" },
      { value: 5, text: "Friday" },
      { value: 6, text: "Saturday" },
      { value: 0, text: "Sunday" }
    ];

    return (
      <Dialog open={this.props.show}>
        <DialogTitle>Choose an action</DialogTitle>
        <DialogContent>
          <List>
            <ListItem
              button
              onClick={() =>
                this.props.copy(copyOneDay.start, copyOneDay.end)
              }
            >
              <ListItemText secondary="Select start and end days of the week. This will clear classes on the end days.">
                Copy 1 day.
              </ListItemText>
            </ListItem>
            <ListItem style={{ justifyContent: 'space-evenly' }}>
              <RadioGroup value={copyOneDay.start} onChange={(e, value) => {
                const copyOneDay = { ...this.state.copyOneDay };
                copyOneDay.start = value;
                copyOneDay.end[value] = 0;
                this.setState({ copyOneDay });
              }}>
                {days.map(
                  day =>
                    <FormControlLabel control={<Radio color="primary" />} value={day.value.toString()} label={day.text} />
                )}
              </RadioGroup>
              <div className="flex column">
                {days.map(
                  day => (this.state.copyOneDay.start !== day.value.toString()) &&
                    <FormControlLabel control={<Checkbox color="primary" checkedIcon={<Done />} name={day.value.toString()} checked={Boolean(copyOneDay.end[day.value.toString()])} onChange={(e, checked) => {
                      const copyOneDay = { ...this.state.copyOneDay };
                      copyOneDay.end[e.target.name] = checked;
                      this.setState({ copyOneDay });
                    }} />} label={day.text} />
                )}
              </div>
            </ListItem>
            <ListItem button onClick={this.props.replace}>
              <ListItemText secondary="This will activate selection mode, select 2 classes in the menu to the left.">
                Replace all instances of 1 class.
              </ListItemText>
              <ListItemIcon><FindReplace /></ListItemIcon>
            </ListItem>
            <ListItem button onClick={this.props.delete}>
              <ListItemText secondary="This will delete all entries in the calendar.">
                Clear calendar.
              </ListItemText>
              <ListItemIcon><Clear /></ListItemIcon>
            </ListItem>
            <ListItem button onClick={this.props.toggleLog}>
              <ListItemText secondary="Show the log for this calendar.">
                Show log.
              </ListItemText>
              <ListItemIcon><Assignment /></ListItemIcon>
            </ListItem>
            <ListItem>
              <ListItemText primary="Keybinds:" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>S</Avatar>
              </ListItemAvatar>
              <ListItemText secondary="Hold shift when dragging a class to make a quick copy"></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>D</Avatar>
              </ListItemAvatar>
              <ListItemText secondary="Clicking DEL upon hovering will perform a quick delete"></ListItemText>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.toggle}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
