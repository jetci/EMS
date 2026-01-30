import { GoogleGenAI, Type } from "@google/genai";
import type { Ride, Driver } from '../types';

// Resolve API key from env at runtime/build
const GEMINI_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY || process.env.API_KEY;
const ai = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY as string }) : null;

/**
 * Calls the Gemini API to get an optimized order of rides.
 * @param rides - An array of active ride objects.
 * @returns A promise that resolves to an array of ride IDs in the optimal order.
 */
export const optimizeRides = async (rides: Ride[]): Promise<string[]> => {
  if (!GEMINI_KEY || !ai) {
    console.warn("Gemini API key not set. Falling back to mock optimization.");
    return [...rides].map(r => r.id).sort(() => Math.random() - 0.5);
  }

  const ridesInfo = rides.map(r => ({
    id: r.id,
    pickup: r.pickupLocation,
    destination: r.destination,
    appointmentTime: r.appointmentTime,
  }));

  const prompt = `
    You are a route optimization expert for a patient transport service in Bangkok, Thailand.
    Given the following list of rides, determine the most efficient sequence to complete them.
    Consider minimizing travel time and ensuring appointments are met.
    The current time is ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}.
    Return the result as a JSON object with a key "optimizedOrder" which is an array of the ride IDs in the suggested sequence.

    Rides:
    ${JSON.stringify(ridesInfo, null, 2)}
  `;

  try {
    const response = await (ai as GoogleGenAI).models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    optimizedOrder: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                        description: "An array of ride IDs in the most efficient sequence."
                    },
                },
                required: ["optimizedOrder"]
            },
        },
    });

    const responseText = response.text.trim();
    const result = JSON.parse(responseText);
    
    if (result && Array.isArray(result.optimizedOrder)) {
        return result.optimizedOrder;
    } else {
        throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not get an optimized route from the AI model.");
  }
};

/**
 * Calls the Gemini API to suggest the best driver for a ride.
 * @param ride - The ride object that needs a driver.
 * @param drivers - An array of available driver objects.
 * @returns A promise that resolves to the ID of the suggested driver.
 */
export const suggestDriver = async (ride: Ride, drivers: Pick<Driver, 'id' | 'fullName' | 'tripsThisMonth'>[]): Promise<string> => {
  if (!GEMINI_KEY || !ai) {
    console.warn("Gemini API key not set. Returning a random driver.");
    if (drivers.length === 0) throw new Error("No drivers available to suggest.");
    return drivers[Math.floor(Math.random() * drivers.length)].id;
  }

  const rideInfo = {
    pickup: ride.pickupLocation,
    destination: ride.destination,
    appointmentTime: ride.appointmentTime,
  };

  const driversInfo = drivers.map(d => ({
    id: d.id,
    name: d.fullName,
    tripsThisMonth: d.tripsThisMonth, // A proxy for experience/reliability
  }));

  const prompt = `
    You are an expert dispatcher for a patient transport service in Thailand.
    Your task is to suggest the best driver for a specific ride from a list of available drivers.
    Consider the ride details and driver information to make the most logical assignment. A driver with more trips might be more reliable or experienced.
    
    Ride Details:
    - Pickup: ${rideInfo.pickup}
    - Destination: ${rideInfo.destination}
    - Appointment: ${rideInfo.appointmentTime}

    Available Drivers:
    ${JSON.stringify(driversInfo, null, 2)}

    Based on this information, which driver (by their ID) is the best choice for this ride?
    Return the result as a JSON object with a single key "suggestedDriverId" containing the ID of the driver you recommend.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedDriverId: {
                        type: Type.STRING,
                        description: "The ID of the most suitable driver for the ride."
                    },
                },
                required: ["suggestedDriverId"]
            },
        },
    });

    const responseText = response.text.trim();
    const result = JSON.parse(responseText);
    
    if (result && typeof result.suggestedDriverId === 'string') {
        const isValidSuggestion = drivers.some(d => d.id === result.suggestedDriverId);
        if (isValidSuggestion) {
            return result.suggestedDriverId;
        }
    }
    throw new Error("Invalid or non-existent driver ID returned from Gemini API");
  } catch (error) {
    console.error("Error calling Gemini API for driver suggestion:", error);
    // As a fallback, return the first available driver
    if (drivers.length > 0) {
        return drivers[0].id;
    }
    throw new Error("Could not get a driver suggestion from the AI model.");
  }
};
