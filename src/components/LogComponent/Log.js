import React, { PureComponent } from 'react'
import { Table, Dialog, DialogTitle, DialogContent, TableHead, TableRow, TableCell, TableBody, DialogActions, Button } from "@material-ui/core";
import axios from "../../axios";

export default class Log extends PureComponent {

    state = {
        log: []
    }

    async componentDidMount() {
        const result = await axios.get(`/v2/event/logs`);
        console.log("what did we get", result);
        this.setState({ log: result.data });
    }
    render() {
        return (
            <Dialog open={this.props.show}>
                <DialogTitle>Log</DialogTitle>
                <DialogContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell>Video_ID</TableCell>
                                <TableCell>Start</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.state.log.map(l =>
                                    <TableRow>
                                        <TableCell>{l.message}</TableCell>
                                        <TableCell>{l.date}</TableCell>
                                        <TableCell>{l.id}</TableCell>
                                        <TableCell>{l.video_id}</TableCell>
                                        <TableCell>{l.start}</TableCell>
                                    </TableRow>)
                            }
                        </TableBody>
                    </Table>
                    <DialogActions>
                        <Button onClick={this.props.toggleLog}>Cancel</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        )
    }
}
