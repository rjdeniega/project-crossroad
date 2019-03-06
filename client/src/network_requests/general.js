/**
 * Created by JasonDeniega on 27/06/2018.
 */
const makeFetchArgs = (data, method, stringifyData) => ({
    body: stringifyData ? JSON.stringify(data) : data, // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json',
    },
    method: method, // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
});


export const getData = (url, data) =>
    fetch(url, makeFetchArgs(data, "GET", true))
        .then(response => response.json());

export const postDataWithImage = (url, data) => {
    return fetch(url, {
        body: data, // must match 'Content-Type' header
        credentials: 'same-origin', //pass cookies, for authentication
        method: 'POST',
        headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        },
    })
        .then(response => response.json()); // parses response to JSON
};
export const postDataWithFile = (url, data) => {
    return fetch(url, {
        body: data, // must match 'Content-Type' header
        credentials: 'same-origin', //pass cookies, for authentication
        headers: {
            'Accept': 'application/json, application/csv, text/plain, text/html, *.*',
        },
        method: 'POST',
    })
        .then(response => response.json()); // parses response to JSON
};


export const postData = (url, data) =>
    fetch(url, makeFetchArgs(data, "POST", true))
        .then(response => response.json());

export const putData = (url, data) =>
    fetch(url, makeFetchArgs(data, "PUT", true))
        .then(response => response.json());

export const putDataWithImage = (url, data) =>
    fetch(url, {body: data, credentials: 'same-origin', headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        }, method: 'PUT'})
        .then(response => response.json());

export const deleteData = (url, data) => {
    // Default options are marked with *
    return fetch(url, {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        },
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    })
        .then(response => response.json()); // parses response to JSON
};
// not sure if this works
