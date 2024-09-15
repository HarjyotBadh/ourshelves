import React from 'react';

const HomeLayout: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome to OurShelves</h1>
            <p>This is the home page of our application.</p>
            <button onClick={() => alert('Button 1 clicked!')}>Button 1</button>
            <button onClick={() => alert('Button 2 clicked!')}>Button 2</button>
            <button onClick={() => alert('Button 3 clicked!')}>Button 3</button>
            <div style={{ marginTop: '20px' }}>
                <input type="text" placeholder="Enter some text" />
                <button onClick={() => alert('Submit clicked!')}>Submit</button>
            </div>
        </div>
    );
};

export default HomeLayout;