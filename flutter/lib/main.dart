import 'package:flutter/material.dart';
import 'package:web_socket_channel/html.dart';
import 'dart:convert' as JSON;
import 'package:provider/provider.dart';

class MyAppBar extends StatelessWidget {
  MyAppBar({this.title});

  // Fields in a Widget subclass are always marked "final".

  final Widget title;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56.0, // in logical pixels
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      decoration: BoxDecoration(color: Colors.blue[500]),
      // Row is a horizontal, linear layout.
      child: Row(
        // <Widget> is the type of items in the list.
        children: <Widget>[
          // IconButton(
          //     icon: Icon(Icons.menu),
          //     tooltip: 'Navigation',
          //     hoverColor: Colors.green[400],
          //     onPressed: null // null disables the button
          //     ),
          // Expanded expands its child to fill the available space.
          Expanded(
            child: title,
          )
        ],
      ),
    );
  }
}

class ProcessList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
        height: double.infinity,
        child:
            Consumer<ProcessListModel>(builder: (context, processList, child) {
          List<Widget> items = [];
          if (processList._items.length > 0) {
            processList._items.forEach((ele) {
              items.add(ProcessItem(ele,
                  processList.itemIsUnfold['${ele['id']}_${ele['name']}']));
            });
          }
          return ListView(padding: const EdgeInsets.all(8), children: items);
        }));

    // return SizedBox(
    //     height: 800.0,
    //     child: ListView(
    //       padding: const EdgeInsets.all(8),
    //       children: <Widget>[

    //       ],
    //     ));
    // return Expanded(
    //     child: Column(
    //   children: [
    //     Consumer<ProcessListModel>(
    //       builder: (context, processList, child) {
    //         List<Widget> items = [];
    //         if (processList._items.length > 0) {
    //           processList._items.forEach((ele) {
    //             items.add(ProcessItem(ele,
    //                 processList.itemIsUnfold['${ele['id']}_${ele['name']}']));
    //           });
    //         }
    //         return Expanded(
    //             child: Column(
    //           // children: items,
    //           children: [],
    //         ));
    //       },
    //     )
    //   ],
    // ));
  }
}

class ProcessItem extends StatelessWidget {
  Map data;
  int pid;
  String id, name, status, cpu, memory;
  bool isUnfold = false;
  var unstableRestarts, pmUptime;

  ProcessItem(data, isUnfold) {
    this.data = data;
    this.id = data['id'].toString();
    this.name = data['name'].toString();
    this.status = data['status'];
    this.cpu = data['cpu'].toString();
    this.memory = data['memory'];
    this.isUnfold = isUnfold;
    this.pid = data['pid'];
    this.unstableRestarts = data['unstable_restarts'].toString();
    this.pmUptime = data['pm_uptime'];
  }

  @override
  Widget build(BuildContext context) {
    var processList = context.watch<ProcessListModel>();
    var bgColor;
    switch (this.status) {
      case 'online':
        bgColor = Colors.green[300];
        break;
      case 'stopped':
        bgColor = Colors.red;
        break;
      case 'stopping':
        bgColor = Colors.amber;
        break;
      case 'errored':
        bgColor = Colors.red;
        break;
      case 'launching':
        bgColor = Colors.amber;
        break;
      case 'one-launch-status':
        bgColor = Colors.amber;
        break;
    }
    return Container(
        margin: const EdgeInsets.all(10.0),
        color: bgColor,
        child: Card(
          color: Colors.black45,
          child: Column(
            children: [
              if (!isUnfold)
                Row(
                  children: [
                    Expanded(
                        flex: 1,
                        child: Row(
                          children: [
                            IconButton(
                                alignment: Alignment.centerLeft,
                                icon: isUnfold
                                    ? Icon(Icons.unfold_less)
                                    : Icon(Icons.unfold_more),
                                color: Colors.blue,
                                iconSize: 36.0,
                                onPressed: () => processList
                                    .setUnfold('${this.id}_${this.name}')),
                          ],
                        )),
                    Expanded(
                        flex: 8,
                        child: Row(
                          children: [
                            Expanded(
                              flex: 1,
                              child: Text(
                                '${this.name}',
                                textAlign: TextAlign.left,
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: Text(
                                'CPU: ${this.cpu}%',
                                textAlign: TextAlign.left,
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: Text(
                                'Mem: ${this.memory} MB',
                                textAlign: TextAlign.left,
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              flex: 1,
                              child: Text(
                                '${this.status}',
                                textAlign: TextAlign.left,
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        )),
                  ],
                ),
              if (isUnfold)
                Container(
                    height: 300,
                    child: Row(
                      children: [
                        Expanded(
                          flex: 1,
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  IconButton(
                                      alignment: Alignment.centerLeft,
                                      icon: isUnfold
                                          ? Icon(Icons.unfold_less)
                                          : Icon(Icons.unfold_more),
                                      color: Colors.blue,
                                      iconSize: 36.0,
                                      onPressed: () => processList.setUnfold(
                                          '${this.id}_${this.name}')),
                                  Text(
                                    '${this.name}',
                                    textAlign: TextAlign.left,
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              ActionButton(this.status, this.name, this.id)
                            ],
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Column(children: [
                            Row(
                              children: [
                                Expanded(
                                    child: SizedBox(
                                  height: 130,
                                  child: Card(
                                    color: Colors.black45,
                                    child: Text(
                                      'CPU: ${this.cpu}%',
                                      textAlign: TextAlign.left,
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                )),
                                Expanded(
                                    child: SizedBox(
                                  height: 130,
                                  child: Card(
                                    color: Colors.black45,
                                    child: Text(
                                      'Mem: ${this.memory} MB',
                                      textAlign: TextAlign.left,
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                )),
                              ],
                            ),
                            Row(
                              children: [
                                Expanded(
                                  child: Card(
                                    child: Column(
                                      children: [
                                        SizedBox(
                                          width: double.infinity,
                                          child: Text('Status: ${this.status}',
                                              textAlign: TextAlign.left),
                                        ),
                                        SizedBox(
                                          width: double.infinity,
                                          child: Text(
                                              'Reset times: ${this.unstableRestarts}',
                                              textAlign: TextAlign.left),
                                        ),
                                        SizedBox(
                                          width: double.infinity,
                                          child: Text(
                                              'Uptime: ${this.pmUptime}',
                                              textAlign: TextAlign.left),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Card(
                                    child: Column(
                                      children: [
                                        // Text(
                                        //   '${this.unstableRestarts}',
                                        //   textAlign: TextAlign.left,
                                        // ),
                                        // Text('${this.pmUptime}',
                                        //     textAlign: TextAlign.left),
                                        // Text('${this.status}',
                                        //     textAlign: TextAlign.left),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            )
                          ]),
                        ),
                        Expanded(
                          flex: 4,
                          child: LogWindows(
                              processList.itemLog['${this.id}_${this.name}']),
                        ),
                      ],
                    )),
            ],
          ),
        ));
  }
}

class ActionButton extends StatelessWidget {
  String status, name, id;
  ActionButton(status, name, id) {
    this.status = status;
    this.name = name;
    this.id = id;
  }
  @override
  Widget build(BuildContext context) {
    var processList = context.watch<ProcessListModel>();
    var statusShowButton = <Widget>[
      RaisedButton(
          onPressed: () {
            processList.getLogsPath(this.id);
            showDialog(
              context: context,
              builder: (_) => LogDialog(),
            );
          },
          child: Row(
            children: [
              Icon(
                Icons.history,
                color: Colors.yellow[400],
                size: 30.0,
              ),
              Text('Logs', style: TextStyle(fontSize: 30)),
            ],
          )),
    ];
    if (this.status == 'online') {
      statusShowButton.add(
        SizedBox(
          height: 10,
        ),
      );
      statusShowButton.add(
        RaisedButton(
          onPressed: () {
            // this.status = "stopping";
            processList.processAction(this.name, 'restart');
          },
          child: Row(
            children: [
              Icon(
                Icons.replay,
                color: Colors.yellow[400],
                size: 30.0,
              ),
              Text('Restart', style: TextStyle(fontSize: 30))
            ],
          ),
        ),
      );
    }
    if (this.status == 'stopped') {
      statusShowButton.add(
        SizedBox(
          height: 10,
        ),
      );
      statusShowButton.add(
        RaisedButton(
          onPressed: () {
            // this.status = "stopped";
            processList.processAction(this.name, 'start');
          },
          child: Row(
            children: [
              Icon(
                Icons.arrow_right,
                color: Colors.green[400],
                size: 30.0,
              ),
              Text('Start', style: TextStyle(fontSize: 30))
            ],
          ),
        ),
      );
    }
    if (this.status == 'online' || this.status == 'errored') {
      statusShowButton.add(
        SizedBox(
          height: 10,
        ),
      );
      statusShowButton.add(
        RaisedButton(
          onPressed: () {
            // this.status = "stopping";
            processList.processAction(this.name, 'stop');
          },
          child: Row(
            children: [
              Icon(
                Icons.stop,
                color: Colors.red,
                size: 30.0,
              ),
              Text('Stop', style: TextStyle(fontSize: 30))
            ],
          ),
        ),
      );
    }
    return Column(
      children: statusShowButton,
    );
  }
}

class LogWindows extends StatelessWidget {
  List itemLog;
  LogWindows(itemLog) {
    this.itemLog = itemLog;
  }
// items
  @override
  Widget build(BuildContext context) {
    List<Widget> items = [];
    this.itemLog.forEach(
        (e) => items.add(Text(e, style: TextStyle(color: Colors.white))));
    return SizedBox(
        height: 300.0,
        child: Card(
          color: Colors.black,
          shadowColor: Colors.yellow,
          child: ListView(
            padding: const EdgeInsets.all(8),
            children: items,
          ),
        ));
  }
}

class MyScaffold extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Material is a conceptual piece of paper on which the UI appears.
    // var processList = context.watch<ProcessListModel>();

    return Material(
      // Column is a vertical, linear layout.
      child: Column(
        children: <Widget>[
          MyAppBar(
            title: Text(
              'pm2_dashboards',
              style: Theme.of(context).primaryTextTheme.headline6,
            ),
          ),
          Expanded(
            child: ProcessList(),
          )
        ],
      ),
    );
  }
}

class MyButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        print('MyButton was tapped!');
      },
      child: Container(
        height: 36.0,
        padding: const EdgeInsets.all(8.0),
        margin: const EdgeInsets.symmetric(horizontal: 8.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(5.0),
          color: Colors.lightGreen[500],
        ),
        child: Center(
          child: Text(
            'Engage',
          ),
        ),
      ),
    );
  }
}

class ProcessListModel extends ChangeNotifier {
  List _items = [];
  Map itemIsUnfold = {};
  Map itemLog = {};
  Map logsPath = {};
  var channel = HtmlWebSocketChannel.connect("ws://127.0.0.1:4567/mainHome");
  List logsShowPath = <Widget>[];
  bool showFileContent = false;
  List logsFile = [];

  ProcessListModel() {
    this.itemIsUnfold = itemIsUnfold;
    this.channel = channel;
    this.channel.stream.listen((message) {
      Map data = JSON.jsonDecode(message);
      if (data['type'] == 'getLogsPath') {
        this.setLogsPath(data);
      }
      if (data['type'] == 'message' && data['data'].length > 0) {
        data['data'].toList().forEach((ele) {
          if (!this
              .itemIsUnfold
              .keys
              .toList()
              .contains('${ele['id']}_${ele['name']}')) {
            this.itemIsUnfold['${ele['id']}_${ele['name']}'] = false;
          }
          if (!this
              .itemLog
              .keys
              .toList()
              .contains('${ele['id']}_${ele['name']}')) {
            this.itemLog['${ele['id']}_${ele['name']}'] = [];
          }
          this.itemLog['${ele['id']}_${ele['name']}'] = ele['log'];
        });
        this.change(data['data']);
      }
      if (data['type'] == 'getLogs') {
        this.setLogs(data['data']);
      }
    });
    this.logsPath = logsPath;
    this.logsFile = logsFile;
    this.showFileContent = showFileContent;
  }

  void change(item) {
    this._items = item.toList();
    notifyListeners();
  }

  void setUnfold(key) {
    this.itemIsUnfold[key] = !this.itemIsUnfold[key];
    notifyListeners();
  }

  void processAction(name, command) {
    final msg = JSON.jsonEncode({'command': command, 'name': name});
    this.channel.sink.add(msg);
  }

  void getLogsPath(id) {
    final msg = JSON.jsonEncode({'command': 'getLogsPath', 'id': id});
    this.channel.sink.add(msg);
  }

  void setLogsPath(data) {
    this.logsPath = data['path'];
    this.logsShowPath = <Widget>[];
    this.logsPath.forEach((key, value) {
      this.logsShowPath.add(RaisedButton(
          onPressed: () {
            this.logsShowPath = <Widget>[];
            this.logsPath[key]['file'].forEach((ele) {
              this.logsShowPath.add(RaisedButton(
                  child: Text(ele),
                  onPressed: () {
                    this.getLogs(
                        {'id': data['id'], 'path': key, 'fileName': ele});
                  }));
              this.changeLogsPath();
            });
          },
          child: Text(key)));
    });
    this.showFileContent = false;
    notifyListeners();
  }

  void changeLogsPath() {
    notifyListeners();
  }

  void getLogs(data) {
    final msg = JSON.jsonEncode({...data, 'command': 'getLogs'});
    this.channel.sink.add(msg);
    notifyListeners();
  }

  void setLogs(data) {
    this.logsFile = data;
    this.showFileContent = true;
    notifyListeners();
  }
}

class LogDialog extends StatelessWidget {
  Widget build(BuildContext context) {
    var processList = context.watch<ProcessListModel>();

    Widget item;
    double width, height;

    print(processList.showFileContent);
    if (processList.showFileContent) {
      item = LogWindows(processList.logsFile);
      width = double.infinity;
      height = double.infinity;
    } else {
      item = ListView(
        padding: const EdgeInsets.all(8),
        children: processList.logsShowPath,
      );
      width = 100;
      height = 400;
    }
    return Dialog(
        child: SizedBox(
      width: width,
      height: height,
      child: item,
    ));
  }
}

void main() async {
  runApp(
    ChangeNotifierProvider(
      create: (context) => ProcessListModel(),
      child: MaterialApp(
        title: 'My app', // used by the OS task switcher
        home: SafeArea(
          child: MyScaffold(),
        ),
      ),
    ),
  );
}
