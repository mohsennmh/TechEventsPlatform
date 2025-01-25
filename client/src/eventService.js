// src/services/eventService.js
export const createEvent = async (eventData) => {
    try {
      const response = await fetch('http://localhost:5000/api/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Error creating event');
    }
  };
  