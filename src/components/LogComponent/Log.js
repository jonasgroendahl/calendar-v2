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
  TablePagination,
  TextField,
  InputAdornment
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import axios from "../../axios";

export default class Log extends PureComponent {
  state = {
    log: [],
    rowsPerPage: 11,
    page: 0,
    search: "",
    attr: [
      { value: "message", text: "Action" },
      { value: "date", text: "Date" },
      { value: "id", text: "ID" },
      { value: "video_id", text: "Video ID" },
      { value: "start", text: "Start" },
      { value: "ip", text: "IP address" }
    ]
  };

  async componentDidMount() {
    const result = await axios.get(`/v2/event/logs`);
    console.log("what did we get", result);
    this.setState({ log: result.data });
  }
  render() {
    const { rowsPerPage, page, search, attr } = this.state;

    const result = this.state.log.filter(l =>
      attr.some(
        a =>
          l[a.value] &&
          l[a.value]
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );

    return (
      <Dialog open={this.props.show} maxWidth={"md"}>
        <DialogTitle>Log</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Search..."
            onChange={event => this.setState({ search: event.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            value={search}
            style={{ float: "right" }}
          />
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
                {result
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
              count={result.length}
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
