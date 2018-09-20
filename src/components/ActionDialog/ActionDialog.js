import React, { PureComponent } from 'react'
import { Dialog, DialogTitle, DialogContent, List, Select, ListItemText, MenuItem, ListItem, Grid, Button, DialogActions } from "@material-ui/core";

export default class ActionDialog extends PureComponent {
    state = {
        days: [
            { value: 1, text: 'Monday' },
            { value: 2, text: 'Tuesday' },
            { value: 3, text: 'Wednesday' },
            { value: 4, text: 'Thursday' },
            { value: 5, text: 'Friday' },
            { value: 6, text: 'Saturday' },
            { value: 7, text: 'Sunday' }
        ],
        copyOneDay: {
            start: 1,
            end: 2
        },
        replaceAll: {
            original: 0,
            new: 0
        }
    }

    handleChange = (event) => {
        const copyOneDay = { ...this.state.copyOneDay };
        copyOneDay[event.target.name] = event.target.value;
        this.setState({ copyOneDay });
    };

    render() {
        const { days, copyOneDay } = this.state;

        return (
            <Dialog open={this.props.show}>
                <DialogTitle>
                    Choose an action
                </DialogTitle>
                <DialogContent>
                    <List>
                        <Grid container>
                            <Grid item xs={8}>
                                <ListItem button onClick={() => this.props.copy(copyOneDay.start, copyOneDay.end)}>
                                    <ListItemText secondary="Select start and end day of the week. This will clear classes on the end day.">Copy 1 day.</ListItemText>
                                </ListItem>
                            </Grid>
                            <Grid item xs={4}>
                                <Select value={copyOneDay.start} onChange={this.handleChange} name="start" fullWidth>
                                    {days.map(day => copyOneDay.end !== day.value && <MenuItem value={day.value} key={`start_${day.value}`}>{day.text}</MenuItem>)}
                                </Select>
                                <Select value={copyOneDay.end} onChange={this.handleChange} name="end" fullWidth style={{ marginTop: 5 }}>
                                    {days.map(day => copyOneDay.start !== day.value && <MenuItem value={day.value} key={`end_${day.value}`}>{day.text}</MenuItem>)}
                                </Select>
                            </Grid>
                        </Grid>
                        <ListItem button onClick={this.props.replace}>
                            <ListItemText secondary="This will activate selection mode, select 2 classes in the menu to the left.">Replace all instances of 1 class.</ListItemText>
                        </ListItem>
                        <ListItem button onClick={this.props.delete}>
                            <ListItemText secondary="This will delete all entries in the calendar.">Clear calendar.</ListItemText>
                        </ListItem>
                        <ListItem button onClick={this.props.toggleLog}>
                            <ListItemText secondary="Show the log for this calendar.">Show log.</ListItemText>
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.toggle}>Cancel</Button>
                </DialogActions>
            </Dialog>
        )
    }
}
