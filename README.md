# Node-Server-Monitor
Node.js status page for monitoring server status

![Demonstration Image](http://larryhui.com/images/example-node-server-monitor.png)

Please run with a process monitor such as [pm2](https://github.com/Unitech/pm2), and modify the configuration before running the service.
More detailed instructions will be added in the near future.

Dependencies: chalk, swig, express, socket.io

This has been tested on node.js v4.2.2 and v4.2.6.

Few things to note:

1. You must install the above dependencies!
2. Line 107 in "template.html" must be changed to point to your server, or by default the service is only accessible to localhost.
3. By default, the service will listen on port 1337.
4. (Optional) If you want SSL support, uncomment lines 59,60,66 and comment out line 68 on "status.js". Also modify the lines as stated in the file.
5. Once you have made the following changes, you can run "status.js" and check out the page for yourself on http://localhost:1337 (or wherever you configured it to be at)!