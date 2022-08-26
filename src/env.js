(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.apiUrl = 'http://localhost:48456/api/gateway/';
  //window.__env.tokenApiUrl = 'http://localhost:56054/';
  
  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = true;
  window.__env.AutoLogOutTime = 5;
  window.__env.configTimerTime = "30";
  window.__env.magerVersions = [{ Name: '1.0', Id: '1.0' }, { Name: '2.0', Id: '2.0' }, { Name: '3.0', Id: '3.0' }, { Name: '4.0', Id: '4.0' }, { Name: '5.0', Id: '5.0' }, { Name: '6.0', Id: '6.0' }, { Name: '7.0', Id: '7.0' }, { Name: '8.0', Id: '8.0' }, { Name: '9.0', Id: '9.0' }];
  window.__env.minorVersions = [{ Name: '1.1', Id: '1.1' }, { Name: '2.1', Id: '2.1' }, { Name: '3.1', Id: '3.1' }, { Name: '4.1', Id: '4.1' }, { Name: '5.1', Id: '5.1' }, { Name: '6.0', Id: '6.1' }, { Name: '7.1', Id: '7.1' }, { Name: '8.1', Id: '8.1' }, { Name: '9.1', Id: '9.1' }];
}(this));