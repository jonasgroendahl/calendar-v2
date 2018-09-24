import React, { PureComponent } from "react";
import {
  Table,
  Dialog,
  DialogTitle,
  DialogContent,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  DialogActions,
  Button,
  TablePagination
} from "@material-ui/core";
import axios from "../../axios";

export default class Log extends PureComponent {
  state = {
    log: [],
    rowsPerPage: 13,
    page: 0
  };

  async componentDidMount() {
    const result = await axios.get(`/v2/event/logs`);
    console.log("what did we get", result);
    this.setState({ log: result.data });
  }
  render() {
    const { rowsPerPage, page } = this.state;

    return (
      <Dialog open={this.props.show} fullScreen>
        <DialogTitle>Log</DialogTitle>
        <DialogContent>
          <div className="table-wrapper">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Video_ID</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.log
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(l => (
                    <TableRow>
                      <TableCell>{l.message}</TableCell>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>{l.id}</TableCell>
                      <TableCell>{l.video_id}</TableCell>
                      <TableCell>{l.start}</TableCell>
                      <TableCell>192.168.1.1</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={(_, value) => this.setState({ page: value })}
              count={this.state.log.length}
              rowsPerPageOptions={[]}
            />
          </div>
          <DialogActions>
            <Button onClick={this.props.toggleLog}>Cancel</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  }
}
