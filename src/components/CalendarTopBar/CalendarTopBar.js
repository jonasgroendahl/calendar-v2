import React from 'react'
import { AppBar, Toolbar, Tooltip, IconButton, Select, MenuItem } from "@material-ui/core";

import {
    ZoomIn,
    ZoomOut,
    Build,
    Redo,
    Undo,
    MoreVert
} from "@material-ui/icons";
import IconMenu from "@material-ui/icons/Menu";




export default function CalendarTopBar(props) {
    const { isDrawerOpen, aIndex, loading, actions, view } = props;

    return (
        <AppBar
            position="static"
            style={{
                boxShadow: "none",
                marginBottom: 5,
                backgroundColor: "transparent"
            }}
        >
            <Toolbar id="toolbar">
                {!isDrawerOpen && (
                    <IconButton
                        onClick={props.toggleDrawerHandler}
                        style={{ marginRight: 10 }}
                    >
                        <IconMenu />
                    </IconButton>
                )}
                <div className="calendar-picker-div flex">
                    <Tooltip disableFocusListener title="Undo action">
                        <div>
                            <IconButton
                                onClick={props.undoHandler}
                                disabled={aIndex === 0 || loading}
                            >
                                <Undo />
                            </IconButton>
                        </div>
                    </Tooltip>
                    <Tooltip disableFocusListener title="Redo action">
                        <div>
                            <IconButton
                                onClick={props.redoHandler}
                                disabled={
                                    actions.length === 0 ||
                                    aIndex === actions.length - 1 ||
                                    loading
                                }
                            >
                                <Redo />
                            </IconButton>
                        </div>
                    </Tooltip>
                    <Tooltip disableFocusListener title="More actions">
                        <IconButton onClick={props.toggleActionList}>
                            <MoreVert />
                        </IconButton>
                    </Tooltip>
                </div>
                <div className="ml-auto topbar-wrapper">
                    <Tooltip disableFocusListener title="Settings">
                        <IconButton onClick={props.toggleSettingsMenu}>
                            <Build />
                        </IconButton>
                    </Tooltip>
                    <Tooltip disableFocusListener title="Zoom in">
                        <IconButton onClick={() => props.zoomHandler("in")}>
                            <ZoomIn />
                        </IconButton>
                    </Tooltip>
                    <Tooltip disableFocusListener title="Zoom out">
                        <IconButton onClick={() => props.zoomHandler("out")}>
                            <ZoomOut />
                        </IconButton>
                    </Tooltip>
                    {false ? (
                        <Select
                            value={view}
                            onChange={props.viewChangeHandler}
                            disableUnderline
                            style={{ marginLeft: 5 }}
                        >
                            <MenuItem value="agendaWeek">Week</MenuItem>
                            <MenuItem value="agendaDay">Day</MenuItem>
                        </Select>
                    ) : null}
                </div>
            </Toolbar>
        </AppBar>
    )
}
