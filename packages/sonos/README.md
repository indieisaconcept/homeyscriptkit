# Sonos

This script provides extended Sonos support for managing a home theatre setup.

## Actions

- **toggleHomeTheater** \_Toggle Home Theatre ( Sub/Surround - keeps both
  in-sync )
- **toggleSurround** _Toggle Surround_
- **toggleSubwoofer** _Toggle Subwoofer_

## Configuration

In order to use execute this script use the HomeyScript run with argument card
and provide an argument using the format below.

```
hsk://sonos/<action>/<result:optional>?ip=<ip-address-of-soundbar>
```

**Examples:**

```
# Standard result: sonos.toggleSurround.Result
hsk://sonos/toggleSurround?ip=192.168.1.1

# Custom result key: homeTheatre.Result
hsk://sonos/toggleHomeTheatre/homeTheatre?ip=192.168.1.1
```

Review system settings in the Sonos app to obtain the IP address of your primary
soundbar.
