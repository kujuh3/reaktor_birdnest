export const fetchData = (url) =>
  fetch(url, {
    method: "GET",
    //These were used originally for a more universally compatible approach
    //where the proxy API could be used to fetch data from any url and target address.
    // headers: {
    //   TargetURL: "http://assignments.reaktor.com/",
    //   TargetRoute: url,
    // },
  });
