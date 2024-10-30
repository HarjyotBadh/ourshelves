import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface ClockAnalogProps {
  size?: number;
  colorClock?: string;
  colorNumber?: string;
  colorCenter?: string;
  colorHour?: string;
  colorMinutes?: string;
  colorSeconds?: string;
  showSeconds?: boolean;
  autostart?: boolean;
  hour?: number;
  minutes?: number;
  seconds?: number;
  timeZone?: number;
}

const ClockAnalog: React.FC<ClockAnalogProps> = ({
  size = 100,
  colorClock = 'rgba(255,255,255,0.8)',
  colorNumber = '#000',
  colorCenter = '#000',
  colorHour = '#000',
  colorMinutes = '#000',
  colorSeconds = 'red',
  showSeconds = true,
  autostart = true,
  hour: propHour,
  minutes: propMinutes,
  seconds: propSeconds,
  timeZone = 0,
}) => {
  const [hour, setHour] = useState<number | undefined>(propHour);
  const [minutes, setMinutes] = useState<number | undefined>(propMinutes);
  const [seconds, setSeconds] = useState<number | undefined>(propSeconds);
  const [ping, setPing] = useState(false);

  // Handle time updates based on autostart
  useEffect(() => {
    if (autostart) {
      const interval = setInterval(() => {
        setPing((prevPing) => !prevPing);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [autostart]);

  // Handle clock updates when props change
  useEffect(() => {
    const date = new Date(new Date().toUTCString());
    date.setHours(date.getHours() + timeZone - 6);

    const updatedHour = propHour !== undefined ? propHour : date.getHours();
    const updatedMinutes = propMinutes !== undefined ? propMinutes : date.getMinutes();
    const updatedSeconds = propSeconds !== undefined ? propSeconds : date.getSeconds();

    setHour(updatedHour > 12 ? updatedHour - 12 : updatedHour);
    setMinutes(updatedMinutes / 5);
    setSeconds(updatedSeconds > 60 ? updatedSeconds - 60 : updatedSeconds);
  }, [propHour, propMinutes, propSeconds, timeZone, ping]);

  const lanHour = size / 6;
  const lanMinutes = size / 3.75;
  const lanSeconds = size / 3.75;

  return (
    <View
      style={{
        backgroundColor: colorClock,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
        height: size,
        width: size,
      }}
    >
      {[...Array(12).keys()].map((i) => {
        const a = -60 + 30 * i;
        const b = 60 - 30 * i;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              transform: [{ rotate: `${a}deg` }, { translateX: size / 2 - 15 }],
            }}
          >
            <Text
              style={{
                color: colorNumber,
                fontSize: size / 9,
                fontWeight: 'bold',
                transform: [{ rotate: `${b}deg` }],
              }}
            >
              {i + 1}
            </Text>
          </View>
        );
      })}
      <View
        style={{
          zIndex: 1,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colorCenter,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: lanHour,
          height: 4,
          borderRadius: 4,
          backgroundColor: colorHour,
          transform: [
            { rotate: `${-90 + (hour! + minutes! / 12) * 30}deg` },
            { translateX: lanHour / 2 },
          ],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: lanMinutes,
          height: 4,
          borderRadius: 4,
          backgroundColor: colorMinutes,
          transform: [{ rotate: `${-90 + minutes! * 30}deg` }, { translateX: lanMinutes / 2 }],
        }}
      />
      {showSeconds && (
        <View
          style={{
            position: 'absolute',
            width: lanSeconds,
            height: 2,
            borderRadius: 4,
            backgroundColor: colorSeconds,
            transform: [{ rotate: `${-90 + seconds! * 6}deg` }, { translateX: lanSeconds / 2 }],
          }}
        />
      )}
    </View>
  );
};

export default ClockAnalog;
