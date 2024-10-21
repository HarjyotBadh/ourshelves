import React from 'react';
import { View } from 'tamagui';
import ClockAnalog from './ClockAnalog';
import ClockDigital from './ClockDigital';

interface ClockGraphicProps {
    isAnalog: boolean,
    timeZone: number;
}

const ClockGraphic: React.FC<ClockGraphicProps> = ({ isAnalog, timeZone }) => {
    return (
        <View>
            {isAnalog ?
                <ClockAnalog
                    timeZone={timeZone}
                /> 
            :
                <ClockDigital
                    timeZone={timeZone}
                />
            }
        </View>
    );
};

export default ClockGraphic;