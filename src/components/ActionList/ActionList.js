import React, { PureComponent, Fragment } from 'react'
import {
    List,
    ListItemText,
    ListItem,
    Avatar,
    ListItemIcon,
    Popper,
    Paper,
    ClickAwayListener,
    Checkbox,
    Select,
    MenuItem,
    ListItemSecondaryAction,
    IconButton
} from "@material-ui/core";

import { Assignment, Clear, FindReplace, DeleteSweep, ChevronRight, ChevronLeft, Done } from "@material-ui/icons";

export default class ActionList extends PureComponent {

    state = {
        copyOneDay: {
            start: 1,
            end: {
                '2': 1
            }
        },
        replaceAll: {
            original: 0,
            new: 0
        },
        firstItemExpanded: false,
        isClickAwayActive: 'onMouseUp',
        open: false
    };

    handleChange = event => {
        const copyOneDay = { ...this.state.copyOneDay };
        copyOneDay[event.target.name] = event.target.value;
        copyOneDay.end[event.target.value.toString()] = 0;
        this.setState({ copyOneDay });
    };

    days = [
        { value: 1, text: "Monday" },
        { value: 2, text: "Tuesday" },
        { value: 3, text: "Wednesday" },
        { value: 4, text: "Thursday" },
        { value: 5, text: "Friday" },
        { value: 6, text: "Saturday" },
        { value: 0, text: "Sunday" }
    ];

    toggleClickAway = () => {
        console.log('toggleClickAway');
        const { isClickAwayActive } = this.state;
        if (isClickAwayActive === 'onMouseUp') {
            this.setState({ isClickAwayActive: false });
        }
        else {
            this.setState({ isClickAwayActive: 'onMouseUp' });
        }
    }

    handleOpen = () => {
        this.toggleClickAway();
        this.setState({ open: !this.state.open });
    }

    render() {

        const { copyOneDay, firstItemExpanded, isClickAwayActive } = this.state;

        return (
            <Popper
                open={Boolean(this.props.anchorEl)}
                anchorEl={this.props.anchorEl}
                style={{ zIndex: 1 }}
                placement="bottom-start"
            >
                <ClickAwayListener onClickAway={this.props.clickAway} mouseEvent={isClickAwayActive}>
                    <Paper>
                        <List>
                            {!firstItemExpanded ?
                                <Fragment>
                                    <ListItem
                                        button
                                        onClick={() => this.setState({ firstItemExpanded: !firstItemExpanded })}
                                    >
                                        <ListItemIcon>
                                            <DeleteSweep />
                                        </ListItemIcon>
                                        <ListItemText>
                                            Perform daily copy
                                    </ListItemText>
                                        <ListItemIcon>
                                            <ChevronRight />
                                        </ListItemIcon>
                                    </ListItem>
                                    <ListItem button onClick={this.props.replace}>
                                        <ListItemIcon><FindReplace /></ListItemIcon>
                                        <ListItemText secondary="This will activate selection mode, select 2 classes in the menu to the left.">
                                            Replace all instances of 1 class.
                                    </ListItemText>
                                    </ListItem>
                                    <ListItem button onClick={this.props.delete}>
                                        <ListItemIcon><Clear /></ListItemIcon>
                                        <ListItemText secondary="This will delete all entries in the calendar.">
                                            Clear calendar.
                                     </ListItemText>

                                    </ListItem>
                                    <ListItem button onClick={this.props.toggleLog} divider>
                                        <ListItemIcon><Assignment /></ListItemIcon>
                                        <ListItemText secondary="Show the log for this calendar.">
                                            Show log.
                                    </ListItemText>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Keybinds:" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Avatar>S</Avatar>
                                        </ListItemIcon>
                                        <ListItemText secondary="Hold shift when dragging a class to make a quick copy"></ListItemText>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Avatar>D</Avatar>
                                        </ListItemIcon>
                                        <ListItemText secondary="Clicking DEL upon hovering will perform a quick delete"></ListItemText>
                                    </ListItem>
                                </Fragment> :
                                <Fragment>
                                    <ListItem button onClick={() => this.setState({ firstItemExpanded: !this.state.firstItemExpanded })}>
                                        <ListItemIcon>
                                            <ChevronLeft />
                                        </ListItemIcon>
                                        <ListItemText primary="First select the day to copy events from." secondary="Next up select the day(s) you'd like copy and replace to." />
                                        <ListItemSecondaryAction>
                                            <IconButton onClick={() => this.props.copy(copyOneDay.start, copyOneDay.end)}>
                                                <DeleteSweep />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <ListItem divider>
                                        <Select
                                            value={copyOneDay.start}
                                            onChange={this.handleChange}
                                            onOpen={this.handleOpen}
                                            open={this.state.open}
                                            onClose={this.handleOpen}
                                            fullWidth
                                            disableUnderline
                                            name="start"
                                        >
                                            {this.days.map(day => <MenuItem value={day.value}>{day.text}</MenuItem>)}
                                        </Select>
                                    </ListItem>
                                    {this.days.map(
                                        day => (this.state.copyOneDay.start !== day.value) &&
                                            <ListItem>
                                                <ListItemText primary={day.text} />
                                                <Checkbox color="primary" checkedIcon={<Done />} name={day.value.toString()} checked={Boolean(copyOneDay.end[day.value.toString()])} onChange={(e, checked) => {
                                                    const copyOneDay = { ...this.state.copyOneDay };
                                                    copyOneDay.end[e.target.name] = checked;
                                                    this.setState({ copyOneDay });
                                                }} />
                                            </ListItem>
                                    )}
                                </Fragment>}
                        </List>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        )
    }
}
