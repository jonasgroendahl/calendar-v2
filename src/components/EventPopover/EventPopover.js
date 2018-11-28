import React from 'react';

import {
    Card,
    CardContent,
    CardActions,
    Popover,
    ListItem,
    List,
    ListItemText,
    Avatar,
    Button,
    MenuItem,
    Select,
    IconButton
} from "@material-ui/core";

import {
    Delete,
    SignalCellular1Bar,
    SignalCellular2Bar,
    SignalCellular0Bar,
    Timer,
    Title,
    Favorite
} from "@material-ui/icons";

import { convertSecondsToHourMinute } from "../../utils/functions";

export default function EventPopover(props) {

    const { selectedEvent, selectedEventDetails, type } = props;

    return (
        <Popover
            anchorEl={selectedEvent ? selectedEvent : null}
            open={Boolean(selectedEvent)}
            placement="right"
            style={{ zIndex: 2, marginLeft: 4 }}
            onClose={props.handleClosePopover}>
            <Card style={{ width: 300 }}>
                <CardContent>
                    <List>
                        <ListItem>
                            <Avatar>
                                <Title />
                            </Avatar>
                            <ListItemText>{selectedEventDetails.title}{` (${selectedEventDetails.extendedProps.language}) `}</ListItemText>
                        </ListItem>
                        <ListItem>
                            <Avatar>
                                <Timer />
                            </Avatar>
                            <ListItemText
                                primary={convertSecondsToHourMinute(selectedEventDetails.extendedProps.sf_varighedsec)}
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
                            <ListItemText primary={selectedEventDetails.extendedProps.level} />
                        </ListItem>
                    </List>
                    {type === "advanced" && (
                        <Select
                            disableUnderline
                            value={selectedEventDetails.seperation_count}
                            onChange={props.changeRecurringPattern}
                        >
                            <MenuItem dense value={0}>
                                Doesn't repeat
                    </MenuItem>
                            <MenuItem value={1}>Repeat weekly</MenuItem>
                        </Select>
                    )}
                </CardContent>
                <CardActions>
                    <Button onClick={props.onEventDelete} color="primary">
                        <Delete style={{ marginRight: 10 }} /> Delete
                </Button>
                    <IconButton style={{ color: selectedEventDetails && selectedEventDetails.extendedProps.fav ? 'red' : 'initial' }} onClick={props.addFav}>
                        <Favorite />
                    </IconButton>
                </CardActions>
            </Card>
        </Popover>
    );
}