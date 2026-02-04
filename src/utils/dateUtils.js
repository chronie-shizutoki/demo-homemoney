const DateUtils = {
  format(date, formatStr) {
    const d = date ? new Date(date) : new Date();
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return formatStr
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  date(date) {
    const d = date ? new Date(date) : new Date();
    return d.getDate();
  },

  daysInMonth(date) {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return new Date(year, month, 0).getDate();
  },

  valueOf(date) {
    const d = date ? new Date(date) : new Date();
    return d.getTime();
  }
};

export default DateUtils;
