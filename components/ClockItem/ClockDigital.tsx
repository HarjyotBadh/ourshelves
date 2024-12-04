import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface ClockDigitalProps {
    fontSize?: number;
    colorText?: string;
    timeZone?: number;
    showSeconds?: boolean;
    autostart?: boolean;
    hour?: number;
    minutes?: number;
    seconds?: number;
}

const ClockDigital: React.FC<ClockDigitalProps> = ({
    fontSize = 25,
    colorText = '#000',
    timeZone = 0,
    showSeconds = true,
    autostart = true,
    hour: propHour,
    minutes: propMinutes,
    seconds: propSeconds,
}) => {
    const [hour, setHour] = useState<number | undefined>(propHour);
    const [minutes, setMinutes] = useState<number | undefined>(propMinutes);
    const [seconds, setSeconds] = useState<number | undefined>(propSeconds);
    const [ping, setPing] = useState(false);

    useEffect(() => {
        if (autostart) {
            const interval = setInterval(() => {
                setPing((prevPing) => !prevPing);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [autostart]);

    useEffect(() => {
        const date = new Date(new Date().toUTCString());
        date.setHours(date.getHours() + timeZone - 6);

        const updatedHour = propHour !== undefined ? propHour : date.getHours();
        const updatedMinutes = propMinutes !== undefined ? propMinutes : date.getMinutes();
        const updatedSeconds = propSeconds !== undefined ? propSeconds : date.getSeconds();

        setHour(updatedHour > 12 ? updatedHour - 12 : updatedHour);
        setMinutes(updatedMinutes);
        setSeconds(updatedSeconds);
    }, [propHour, propMinutes, propSeconds, timeZone, ping]);

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text
                style={{
                    fontSize: 20,
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(139, 69, 19, 1)',
                    padding: 9,
                    width: "100%",
                    height: "70%",
                }}
            >
                {hour?.toString().padStart(2, '0')}:
                {minutes?.toString().padStart(2, '0')}
                {showSeconds && `:${seconds?.toString().padStart(2, '0')}`}
            </Text>
        </View>
    );
};

export default ClockDigital;
