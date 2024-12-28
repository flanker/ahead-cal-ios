import dayjs, { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { HOLIDAYS } from "@/components/constants";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MonthCalendarProps {
  date: Dayjs;
  currentDate: Dayjs;
  headerStyle?: object;
  style?: object;
}

function MonthCalendar({
  date,
  currentDate,
  headerStyle,
  style,
}: MonthCalendarProps) {
  const daysInMonth = date.daysInMonth();
  const firstDay = date.startOf("month");
  const startOffset = firstDay.day();

  const days: (Dayjs | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => firstDay.add(i, "day")),
  ];

  const isHoliday = (date: Dayjs | null) => {
    if (!date) return null;
    const dateStr = date.format("YYYY-MM-DD");
    return HOLIDAYS[dateStr];
  };

  const isToday = (date: Dayjs | null) => {
    if (!date) return false;
    return date.format("YYYY-MM-DD") === currentDate.format("YYYY-MM-DD");
  };

  const isWeekend = (date: Dayjs | null) => {
    if (!date) return false;
    const day = date.day();
    return day === 0 || day === 6;
  };

  const renderDay = (date: Dayjs | null) => {
    const holiday = isHoliday(date);
    return (
      <View
        style={[
          styles.day,
          isToday(date) && styles.today,
          isWeekend(date) && styles.weekend,
          holiday && styles.holiday,
        ]}
      >
        <Text style={[
          styles.dayText,
          !date && styles.emptyDay,
          isToday(date) && styles.todayText
        ]}>
          {date?.date()}
        </Text>
        {holiday && (
          <Text style={styles.holidayText} numberOfLines={1}>
            {holiday.name}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.monthContainer, style]}>
      <Text style={[styles.monthTitle, headerStyle]}>
        {date.format("MMMM YYYY")}
      </Text>
      <View style={styles.calendarGrid}>
        <View style={styles.weekdayRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <View key={day} style={styles.weekday}>
              <Text style={styles.weekdayText}>{day[0]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, i) => (
            <View key={i} style={styles.dayWrapper}>
              {renderDay(day)}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const NAVIGATION_HEIGHT = 60; // 导航栏高度

export default function Calendar() {
  const insets = useSafeAreaInsets();
  const [monthOffset, setMonthOffset] = React.useState(0);

  const handlePrevMonth = () => setMonthOffset((prev) => prev - 1);
  const handleNextMonth = () => setMonthOffset((prev) => prev + 1);
  const handleToday = () => setMonthOffset(0);

  const currentDate = dayjs();
  const firstMonth = currentDate.add(monthOffset, "month");
  const secondMonth = firstMonth.add(1, "month");

  return (
    <View style={[
      styles.container,
      {
        height: SCREEN_HEIGHT - insets.bottom,
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }
    ]}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.calendarContainer}>
        <MonthCalendar
          date={firstMonth}
          currentDate={currentDate}
          style={[
            styles.monthCalendar,
            { height: (SCREEN_HEIGHT - insets.top - insets.bottom - NAVIGATION_HEIGHT - insets.bottom) / 2 }
          ]}
        />
        <MonthCalendar
          date={secondMonth}
          currentDate={currentDate}
          headerStyle={styles.secondMonthHeader}
          style={[
            styles.monthCalendar,
            { height: (SCREEN_HEIGHT - insets.top - insets.bottom - NAVIGATION_HEIGHT - insets.bottom) / 2 }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  navigation: {
    height: NAVIGATION_HEIGHT,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 20,
  },
  todayText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  monthCalendar: {
    flex: 1,
  },
  monthContainer: {
    flex: 1,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  calendarGrid: {
    width: "100%",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekday: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  dayWrapper: {
    width: "14.28%",
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "400",
  },
  emptyDay: {
    opacity: 0,
  },
  today: {
    backgroundColor: '#e6f3ff',
  },
  weekend: {
    backgroundColor: "#f8f8f8",
  },
  holiday: {
    backgroundColor: "#ffe6e6",
  },
  holidayText: {
    fontSize: 10,
    color: "#ff4d4d",
    position: "absolute",
    bottom: 2,
    width: "100%",
    textAlign: "center",
  },
  secondMonthHeader: {
    marginTop: 8,
  },
});
