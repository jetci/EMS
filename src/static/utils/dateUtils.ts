
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isTodayPlugin from 'dayjs/plugin/isToday'
import buddhistEra from 'dayjs/plugin/buddhistEra';
import 'dayjs/locale/th';

// Extend dayjs with necessary plugins
dayjs.extend(buddhistEra);
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isTodayPlugin)

// Set the locale globally to Thai for all dayjs operations in this utility file
dayjs.locale('th');


/**
 * Formats a date string or Date object into a short Thai date format (DD/MM/YYYY B.E.).
 * Example: "17/09/2568"
 * @param date - The date to format (string or Date object).
 */
export const formatDateToThai = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return dayjs(date).format('DD/MM/BBBB');
  } catch (error) {
    console.error("Invalid date for formatDateToThai:", date, error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string or Date object into a short Thai date and time format.
 * Example: "17/09/2568, 14:00"
 * @param dateTime - The date-time to format (string or Date object).
 */
export const formatDateTimeToThai = (dateTime: string | Date): string => {
  if (!dateTime) return 'N/A';
  try {
     return dayjs(dateTime).format('DD/MM/BBBB, HH:mm');
  } catch (error) {
    console.error("Invalid date for formatDateTimeToThai:", dateTime, error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string or Date object into a full, readable Thai date format.
 * Example: "17 กันยายน 2568"
 * @param date - The date to format (string or Date object).
 */
export const formatFullDateToThai = (date: string | Date): string => {
    if (!date) return '';
    try {
        return dayjs(date).format('D MMMM BBBB');
    } catch (error) {
        console.error("Invalid date for formatFullDateToThai:", date, error);
        return '';
    }
};

/**
 * Checks if a given date is today.
 * @param date - The date to check (string or Date object).
 * @returns True if the date is today, false otherwise.
 */
export const isToday = (date: string | Date): boolean => {
    if (!date) return false;
    return dayjs(date).isToday();
};