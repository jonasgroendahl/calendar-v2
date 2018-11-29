import api from "./api.js";

const WebAPI = {
    addCalendar: function (payload) {
        return api.post(`/v2/calendars`, payload);
    },

    cloneCalendar: function (id, payload) {
        return api.post(`/v2/calendars/${id}/events/clone`, payload);
    },

    getCalendarEvents: function (id) {
        return api.get(`/v2/calendars/${id}/events`);
    },

    addEvent: function (payload) {
        return api.post(`/v2/events`, payload)
    },

    deleteEvent: function (id) {
        return api.delete(`/v2/events/${id}`);
    },

    getCalendars: function (id) {
        return api.get(`/v2/gyms/${id}/calendars`);
    },

    deleteCalendar: function (id) {
        return api.delete(`/v2/calendars/${id}`);
    },

    updateEvent: function (id, payload) {
        return api.put(`/v2/events/${id}`, payload);
    },

    updateMultipleEvents: function (payload) {
        return api.post(`/v2/events/multiple`, payload);
    },

    deleteAllEvents: function (calendar_id) {
        return api.delete(`/v2/events?calendar_id=${calendar_id}`);
    },

    getContent: function () {
        return api.get(`/v2/content`);
    }
}

export default WebAPI;