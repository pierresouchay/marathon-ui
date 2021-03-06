import {expect} from "chai";

import AppFormTransforms from "../../js/stores/transforms/AppFormTransforms";

describe("App Form Field to Model Transform", function () {

  describe("transforms", function () {

    it("accepted resource roles string to an array of roles", function () {
      expect(AppFormTransforms.FieldToModel.
          acceptedResourceRoles("*,test1"))
        .to.deep.equal(["*", "test1"]);
      expect(AppFormTransforms.FieldToModel.acceptedResourceRoles(""))
        .to.deep.equal([]);
    });

    it("cpus to float", function () {
      expect(AppFormTransforms.FieldToModel.cpus("434.55")).to.equal(434.55);
      expect(AppFormTransforms.FieldToModel.cpus("434.556633"))
        .to.equal(434.556633);
    });

    it("disk to float", function () {
      expect(AppFormTransforms.FieldToModel.disk("33")).to.equal(33);
      expect(AppFormTransforms.FieldToModel.disk("33.23")).to.equal(33.23);
    });

    describe("constraints", function () {
      it("to array with segments", function () {
        var constraints = "hostname:UNIQUE, atomic:LIKE:man";
        expect(AppFormTransforms.FieldToModel.constraints(constraints))
          .to.deep.equal([
            ["hostname", "UNIQUE"],
            ["atomic", "LIKE", "man"]
          ]);
      });
      it("without inserting empty items", function () {
        var constraints = "";
        expect(AppFormTransforms.FieldToModel.constraints(constraints))
          .to.deep.equal([]);
      });
    });

    describe("container volumes", function () {
      it("to array of objects", function () {
        expect(AppFormTransforms.FieldToModel.containerVolumes([
          {
            containerPath: "/etc/a",
            hostPath: "/var/data/a",
            mode: "RO",
            consecutiveKey: 1
          }
        ])).to.deep.equal([
            {containerPath: "/etc/a", hostPath: "/var/data/a", mode: "RO"}
        ]);
      });

      it("to empty array", function () {
        expect(AppFormTransforms.FieldToModel.containerVolumes([
          {
            containerPath: "",
            hostPath: "",
            mode: "",
            consecutiveKey: 1
          }
        ])).to.deep.equal([]);
      });

      describe("local volumes", function () {
        it("should contain local volumes", function () {
          var localVolumesArray = [
            {
              containerPath: "/var/data",
              persistentSize: "10",
              consecutiveKey: 1
            }
          ];
          var expectedLocalVolumesArray = [
            {
              containerPath: "/var/data",
              persistent: {
                size: 10
              },
              mode: "RW"
            }
          ];
          expect(AppFormTransforms.FieldToModel.localVolumes(
            localVolumesArray
          )).to.deep.equal(expectedLocalVolumesArray);
        });

        it("should remove empty local volumes", function () {
          var localVolumesArray = [
            {
              containerPath: "",
              persistentSize: "",
              consecutiveKey: 1
            }
          ];
          var expectedEmptyArray = [];
          expect(AppFormTransforms.FieldToModel.localVolumes(
            localVolumesArray
          )).to.deep.equal(expectedEmptyArray);
        });

      });
    });

    it("dockerForcePullImage is checked", function () {
      expect(AppFormTransforms.FieldToModel.dockerForcePullImage(true))
        .to.be.true;
      expect(AppFormTransforms.FieldToModel.dockerForcePullImage())
        .to.be.false;
    });

    it("dockerParameters to array of objects", function () {
      expect(AppFormTransforms.FieldToModel.dockerParameters([
        {key: "a-docker-option", value: "xxx", consecutiveKey: 1},
        {key: "b-docker-option", value: "yyy", consecutiveKey: 2}
      ])).to.deep.equal([
          {key: "a-docker-option", value: "xxx"},
          {key: "b-docker-option", value: "yyy"}
      ]);
    });

    it("dockerParameters to empty array", function () {
      expect(AppFormTransforms.FieldToModel.dockerParameters([
        {
          key: "",
          value: "",
          consecutiveKey: 1
        }
      ])).to.deep.equal([]);
    });

    describe("dockerPortMappings", function () {
      it("to the equivalent container.docker.portMappings", function () {
        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            consecutiveKey: 1,
            containerPort: 0,
            protocol: "tcp",
            name: "testport",
            vip: null
          }
        ])).to.deep.equal([
          {
            containerPort: 0,
            protocol: "tcp",
            name: "testport"
          }
        ]);
      });

      it("preserving labels", function () {
        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            consecutiveKey: 1,
            containerPort: 8000,
            protocol: "tcp",
            labels: {"testlabel": "testvalue"},
            name: "testport",
            vip: null
          }
        ])).to.deep.equal([
          {
            containerPort: 8000,
            protocol: "tcp",
            labels: {"testlabel": "testvalue"},
            name: "testport"
          }
        ]);
      });

      it("preserving unknown keys", function () {
        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            containerPort: 8080,
            label: {},
            consecutiveKey: 1
          }
        ])).to.deep.equal([
          {
            containerPort: 8080,
            label: {}
          }
        ]);
      });

      it("setting the right default value for port", function () {
        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            consecutiveKey: 2,
            protocol: "tcp"
          }
        ])).to.deep.equal([
          {
            containerPort: 0,
            protocol: "tcp"
          }
        ]);

        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            consecutiveKey: 3,
            protocol: "tcp",
            containerPort: null
          }
        ])).to.deep.equal([
          {
            containerPort: 0,
            protocol: "tcp"
          }
        ]);
      });

      it("setting the right default value for name", function () {
        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            consecutiveKey: 2,
            name: "",
            protocol: "tcp"
          }
        ])).to.deep.equal([
          {
            name: null,
            containerPort: 0,
            protocol: "tcp"
          }
        ]);
      });

      it("to a cleaned array of multiple objects", function () {
        expect(AppFormTransforms.FieldToModel.dockerPortMappings([
          {
            consecutiveKey: 1,
            containerPort: 0,
            protocol: "tcp",
            name: "testport",
            label: {}
          },
          {
            consecutiveKey: 2,
            containerPort: 0,
            protocol: "udp",
            name: "testport2"
          }
        ])).to.deep.equal([
          {
            containerPort: 0,
            protocol: "tcp",
            name: "testport",
            label: {}
          },
          {
            containerPort: 0,
            protocol: "udp",
            name: "testport2"
          }
        ]);
      });
    });

    it("dockerPrivileged is checked", function () {
      expect(AppFormTransforms.FieldToModel.dockerPrivileged(true))
        .to.be.true;
      expect(AppFormTransforms.FieldToModel.dockerPrivileged())
        .to.be.false;
    });

    it("env to object with key-values", function () {
      expect(AppFormTransforms.FieldToModel.env([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ])).to.deep.equal({
        key1: "value1",
        key2: "value2"
      });
    });

    it("env ignores empty key-values", function () {
      expect(AppFormTransforms.FieldToModel.env([
        {key: "", value: "", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ])).to.deep.equal({key2: "value2"});
    });

    describe("healthChecks", function () {
      it("command string to object", function () {
        var healthCheck = {
          "consecutiveKey": 0,
          "path": "/",
          "protocol": "COMMAND",
          "portIndex": "0",
          "command": "true",
          "gracePeriodSeconds": "300",
          "intervalSeconds": "60",
          "timeoutSeconds": "20",
          "maxConsecutiveFailures": "3",
          "ignoreHttp1xx": false
        };

        expect(AppFormTransforms.FieldToModel.healthChecks([healthCheck]))
          .to.deep.equal([{
            "protocol": "COMMAND",
            "command": {
              "value": "true"
            },
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }]);
      });
    });

    it("instances to integer", function () {
      expect(AppFormTransforms.FieldToModel.instances("2")).to.equal(2);
      expect(AppFormTransforms.FieldToModel.instances("4.5")).to.equal(4);
    });

    it("labels to object with key-values", function () {
      expect(AppFormTransforms.FieldToModel.labels([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1},
        {key: "", value: "", consecutiveKey: 2}
      ])).to.deep.equal({
        key1: "value1",
        key2: "value2"
      });
    });

    it("mem to float", function () {
      expect(AppFormTransforms.FieldToModel.mem("128.64")).to.equal(128.64);
    });

    it("uris string to an array of uris", function () {
      expect(AppFormTransforms.FieldToModel.
          uris("http://test.de/,http://test.com"))
        .to.deep.equal(["http://test.de/", "http://test.com"]);
      expect(AppFormTransforms.FieldToModel.uris(""))
        .to.deep.equal([]);
    });

    describe("portDefinitions rows", function () {
      it("to the equivalent portDefinitions on the model", function () {
        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            consecutiveKey: 1,
            port: 8000,
            protocol: "tcp",
            name: "testport",
            vip: null
          }
        ])).to.deep.equal([
          {
            port: 8000,
            protocol: "tcp",
            name: "testport"
          }
        ]);
      });

      it("preserving labels", function () {
        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            consecutiveKey: 1,
            port: 8000,
            protocol: "tcp",
            labels: {"testlabel": "testvalue"},
            name: "testport",
            vip: null
          }
        ])).to.deep.equal([
          {
            port: 8000,
            protocol: "tcp",
            labels: {"testlabel": "testvalue"},
            name: "testport"
          }
        ]);
      });

      it("preserving unknown keys", function () {
        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            port: 8080,
            label: {},
            consecutiveKey: 1
          }
        ])).to.deep.equal([
          {
            port: 8080,
            label: {}
          }
        ]);
      });

      it("setting the right default value for port", function () {
        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            consecutiveKey: 2,
            protocol: "tcp"
          }
        ])).to.deep.equal([
          {
            port: 0,
            protocol: "tcp"
          }
        ]);

        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            consecutiveKey: 3,
            protocol: "tcp",
            port: null
          }
        ])).to.deep.equal([
          {
            port: 0,
            protocol: "tcp"
          }
        ]);
      });

      it("setting the right default value for name", function () {
        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            consecutiveKey: 2,
            name: "",
            protocol: "tcp"
          }
        ])).to.deep.equal([
          {
            name: null,
            port: 0,
            protocol: "tcp"
          }
        ]);
      });

      it("to a cleaned array of multiple objects", function () {
        expect(AppFormTransforms.FieldToModel.portDefinitions([
          {
            consecutiveKey: 1,
            port: 0,
            protocol: "tcp",
            name: "testport",
            label: {}
          },
          {
            consecutiveKey: 2,
            port: 0,
            protocol: "udp",
            name: "testport2"
          }
        ])).to.deep.equal([
          {
            port: 0,
            protocol: "tcp",
            name: "testport",
            label: {}
          },
          {
            port: 0,
            protocol: "udp",
            name: "testport2"
          }
        ]);
      });

    });

  });

});

describe("App Form Model To Field Transform", function () {

  describe("transforms", function () {

    it("accepted resource roles string to an array of roles", function () {
      expect(AppFormTransforms.ModelToField
          .acceptedResourceRoles(["*", "test1"]))
        .to.equal("*, test1");
    });

    it("constraints array to string", function () {
      expect(AppFormTransforms.ModelToField.constraints([
          ["hostname", "UNIQUE"],
          ["atomic", "LIKE", "man"]
      ]))
      .to.equal("hostname:UNIQUE, atomic:LIKE:man");
    });

    describe("portDefinitions", function () {
      it("to array with consecutiveKey", function () {
        expect(AppFormTransforms.ModelToField.portDefinitions([
          {
            port: 1,
            protocol: "tcp"
          },
          {
            port: 2,
            protocol: "udp"
          },
          {
            port: 3,
            servicePort: 3,
            protocol: "tcp"
          }
        ])).to.deep.equal([
          {
            consecutiveKey: 0,
            port: 1,
            protocol: "tcp"
          },
          {
            consecutiveKey: 1,
            port: 2,
            protocol: "udp"
          },
          {
            consecutiveKey: 2,
            port: 3,
            servicePort: 3,
            protocol: "tcp"
          }
        ]);
      });

      it("preserves unknown keys", function () {
        expect(AppFormTransforms.ModelToField.portDefinitions([
          {
            port: 1,
            hostPort: 8,
            servicePort: 5,
            protocol: "tcp",
            name: "testport",
            label: {}
          }
        ])).to.deep.equal([
          {
            consecutiveKey: 0,
            port: 1,
            hostPort: 8,
            servicePort: 5,
            protocol: "tcp",
            name: "testport",
            label: {}
          }
        ]);
      });

    });

    it("dockerParameters to array with consecutiveKey", function () {
      expect(AppFormTransforms.ModelToField.dockerParameters([
        {key: "key1", value: "value1"},
        {key: "key2", value: "value2"}
      ])).to.deep.equal([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ]);
    });

    describe("dockerPortMappings", function () {
      it("to array with consecutiveKey", function () {
        expect(AppFormTransforms.ModelToField.dockerPortMappings([
          {
            containerPort: 1,
            protocol: "tcp"
          },
          {
            containerPort: 2,
            protocol: "udp"
          },
          {
            containerPort: 3,
            servicePort: 3,
            protocol: "tcp"
          }
        ])).to.deep.equal([
          {
            consecutiveKey: 0,
            containerPort: 1,
            protocol: "tcp"
          },
          {
            consecutiveKey: 1,
            containerPort: 2,
            protocol: "udp"
          },
          {
            consecutiveKey: 2,
            containerPort: 3,
            servicePort: 3,
            protocol: "tcp"
          }
        ]);
      });

      it("preserves unknown keys", function () {
        expect(AppFormTransforms.ModelToField.dockerPortMappings([
          {
            containerPort: 1,
            hostPort: 8,
            servicePort: 5,
            protocol: "tcp",
            name: "testport",
            label: {}
          }
        ])).to.deep.equal([
          {
            consecutiveKey: 0,
            containerPort: 1,
            hostPort: 8,
            servicePort: 5,
            protocol: "tcp",
            name: "testport",
            label: {}
          }
        ]);
      });

    });

    it("containerVolumes to array with consecutiveKey", function () {
      expect(AppFormTransforms.ModelToField.containerVolumes([
        {containerPath: "/a/b", hostPath: "/c", mode: "RO"},
        {containerPath: "/e/f", hostPath: "/g/h", mode: "RW"}
      ])).to.deep.equal([
        {containerPath: "/a/b", hostPath: "/c", mode: "RO", consecutiveKey: 0},
        {containerPath: "/e/f", hostPath: "/g/h", mode: "RW", consecutiveKey: 1}
      ]);
    });

    describe("container Volumes Local", function () {
      it("provides the right array", function () {
        var containerVolumesWithLocalVolume = [
          {
            containerPath: "/a/b",
            persistent: {
              size: 10
            },
            mode: "RW"
          }
        ];
        var expectedLocalVolumesArray = [
          {
            containerPath: "/a/b",
            persistentSize: 10,
            mode: "RW",
            consecutiveKey: 0
          }
        ];
        expect(AppFormTransforms.ModelToField.localVolumes(
          containerVolumesWithLocalVolume
        )).to.deep.equal(expectedLocalVolumesArray);
      });

      it("should provide an array with 2 items", function () {
        var containerVolumesWithLocalVolumes = [
          {
            containerPath: "/a/b",
            persistent: {
              size: 10
            },
            mode: "RW"
          },
          {
            containerPath: "/a/b/c",
            persistent: {
              size: 25
            },
            mode: "RW"
          }
        ];
        var expectedLocalVolumesArray = [
          {
            containerPath: "/a/b",
            persistentSize: 10,
            mode: "RW",
            consecutiveKey: 0
          },
          {
            containerPath: "/a/b/c",
            persistentSize: 25,
            mode: "RW",
            consecutiveKey: 1
          }
        ];
        expect(AppFormTransforms.ModelToField.localVolumes(
          containerVolumesWithLocalVolumes
        )).to.deep.equal(expectedLocalVolumesArray);
      });

      it("should exclude docker container", function () {
        var containerVolumesWithMixedVolumes = [
          {
            containerPath: "/a/b",
            persistent: {
              size: 10
            },
            mode: "RW"
          },
          {
            containerPath: "/a/b",
            hostPath: "/home",
            mode: "RW"
          },
          {
            containerPath: "/a/b/c",
            persistent: {
              size: 25
            },
            mode: "RW"
          }
        ];
        var expectedLocalVolumesArray = [
          {
            containerPath: "/a/b",
            persistentSize: 10,
            mode: "RW",
            consecutiveKey: 0
          },
          {
            containerPath: "/a/b/c",
            persistentSize: 25,
            mode: "RW",
            consecutiveKey: 1
          }
        ];
        expect(AppFormTransforms.ModelToField.localVolumes(
          containerVolumesWithMixedVolumes
        )).to.deep.equal(expectedLocalVolumesArray);
      });

      it("should return an empty array", function () {
        var containerVolumesWithDockerVolume = [
          {
            containerPath: "/a/b",
            hostPath: "/home",
            mode: "RW"
          }
        ];
        var expectedLocalVolumesArray = [];
        expect(AppFormTransforms.ModelToField.localVolumes(
          containerVolumesWithDockerVolume
        )).to.deep.equal(expectedLocalVolumesArray);
      });

      it("should return an empty array", function () {
        var containerVolumesWithoutVolume = [];
        var expectedLocalVolumesArray = [];
        expect(AppFormTransforms.ModelToField.localVolumes(
          containerVolumesWithoutVolume
        )).to.deep.equal(expectedLocalVolumesArray);
      });
    });

    it("env object to sorted array", function () {
      expect(AppFormTransforms.ModelToField.env({
        key1: "value1",
        key2: "value2"
      })).to.deep.equal([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ]);
    });

    it("labels object to sorted array", function () {
      expect(AppFormTransforms.ModelToField.labels({
        key1: "value1",
        key2: "value2"
      })).to.deep.equal([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ]);
    });

    describe("healthChecks", function () {
      it("command object to string", function () {
        var healthCheck = {
          "path": "/",
          "protocol": "COMMAND",
          "portIndex": 0,
          "command": {
            "value": "true"
          },
          "gracePeriodSeconds": 300,
          "intervalSeconds": 60,
          "timeoutSeconds": 20,
          "maxConsecutiveFailures": 3,
          "ignoreHttp1xx": false
        };

        expect(AppFormTransforms.ModelToField.healthChecks([healthCheck]))
          .to.deep.equal([{
            "consecutiveKey": 0,
            "path": "/",
            "protocol": "COMMAND",
            "portIndex": 0,
            "portType": "PORT_INDEX",
            "command": "true",
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }]);
      });

      describe("only contains the specified port field", function () {
        it("Port Number", function () {
          var expectedHealthCheckWithPortNumberType = [{
            "consecutiveKey": 0,
            "path": "/",
            "protocol": "HTTP",
            "port": 8080,
            "portType": "PORT_NUMBER",
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }];

          var ObjectWithoutPortNumberType = [{
            "path": "/",
            "protocol": "HTTP",
            "port": 8080,
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }];

          expect(AppFormTransforms.ModelToField.healthChecks(
            ObjectWithoutPortNumberType
          )).to.deep.equal(expectedHealthCheckWithPortNumberType);
        });

        it("Port Index", function () {
          var expectedHealthCheckWithPortIndexType = [{
            "consecutiveKey": 0,
            "path": "/",
            "protocol": "HTTP",
            "portIndex": 1,
            "portType": "PORT_INDEX",
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }];

          var objectWithoutPortIndexType = [{
            "path": "/",
            "protocol": "HTTP",
            "portIndex": 1,
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }];

          expect(AppFormTransforms.ModelToField.healthChecks(
            objectWithoutPortIndexType
          )).to.deep.equal(expectedHealthCheckWithPortIndexType);
        });

      });

    });

    it("uris string to an array of uris", function () {
      expect(AppFormTransforms.ModelToField
          .uris(["http://test.de/", "http://test.com"]))
        .to.equal("http://test.de/, http://test.com");
    });

  });

});
