import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList } from "react-native";
import { HOLIDAYS } from "@/components/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
        <Text
          style={[
            styles.dayText,
            !date && styles.emptyDay,
            isToday(date) && styles.todayText,
          ]}
        >
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

export default function Calendar() {
  const insets = useSafeAreaInsets();
  const [months, setMonths] = useState<Dayjs[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const initialScrollDone = useRef(false);

  // 修正初始化月份数据，以当前月份为中心
  useEffect(() => {
    const currentMonth = dayjs();
    const initialMonths = Array.from({ length: 24 }, (_, i) => {
      return currentMonth.subtract(12 - i, "month");
    });
    setMonths(initialMonths);
  }, []);

  // 计算每个月需要的行数
  const getMonthRows = (date: Dayjs) => {
    const firstDay = date.startOf("month");
    const startOffset = firstDay.day();
    const daysInMonth = date.daysInMonth();
    return Math.ceil((startOffset + daysInMonth) / 7);
  };

  // 计算每个月的高度
  const getMonthHeight = (date: Dayjs) => {
    const rows = getMonthRows(date);
    const HEADER_HEIGHT = 60; // 月份标题高度
    const WEEKDAY_ROW_HEIGHT = 30; // 星期行高度
    const DAY_ROW_HEIGHT = 50; // 每行日期的高度
    const PADDING = 24; // 上下padding总和

    return HEADER_HEIGHT + WEEKDAY_ROW_HEIGHT + rows * DAY_ROW_HEIGHT + PADDING;
  };

  // 更新 getItemLayout 以支持动态高度
  const getItemLayout = (data: any, index: number) => {
    if (!data || data.length === 0) return { length: 0, offset: 0, index };

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getMonthHeight(data[i]);
    }

    const length = getMonthHeight(data[index]);
    return { length, offset, index };
  };

  // 修改初始滚动逻辑
  useEffect(() => {
    if (months.length > 0 && !initialScrollDone.current && isInitialized) {
      initialScrollDone.current = true;

      // 计算到当前月的偏移量
      let offset = 0;
      for (let i = 0; i < 12; i++) {
        offset += getMonthHeight(months[i]);
      }

      // 确保在下一帧执行滚动
      requestAnimationFrame(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset,
            animated: false,
          });
        }
      });
    }
  }, [months, isInitialized]);

  // 监听 FlatList 引用更新
  useEffect(() => {
    if (flatListRef.current && !isInitialized) {
      setIsInitialized(true);
    }
  }, [flatListRef.current]);

  // 加载更多月份（向下）
  const loadMoreMonths = () => {
    const lastMonth = months[months.length - 1];
    const newMonths = Array.from({ length: 6 }, (_, i) => {
      return lastMonth.add(i + 1, "month");
    });
    setMonths([...months, ...newMonths]);
  };

  // 加载更早的月份（向上）
  const loadPreviousMonths = () => {
    const firstMonth = months[0];
    const newMonths = Array.from({ length: 6 }, (_, i) => {
      return firstMonth.subtract(6 - i, "month");
    });

    // 计算新增月份的总高度
    let heightOffset = 0;
    newMonths.forEach((month) => {
      heightOffset += getMonthHeight(month);
    });

    // 先更新月份数据
    setMonths([...newMonths, ...months]);

    // 在下一帧调整滚动位置
    requestAnimationFrame(() => {
      if (flatListRef.current) {
        const currentOffset = flatListRef.current.props.contentOffset?.y || 0;
        flatListRef.current.scrollToOffset({
          offset: currentOffset + heightOffset,
          animated: false,
        });
      }
    });
  };

  // 处理滚动事件，添加节流
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY < 200 && !isLoadingPrevious) {
      setIsLoadingPrevious(true);
      loadPreviousMonths();
      // 添加延迟以防止频繁加载
      setTimeout(() => {
        setIsLoadingPrevious(false);
      }, 500);
    }
  };

  const renderMonth = ({ item: date }: { item: Dayjs }) => (
    <MonthCalendar
      date={date}
      currentDate={dayjs()}
      style={[styles.monthCalendar, { height: getMonthHeight(date) }]}
    />
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: SCREEN_HEIGHT - insets.bottom,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: 16,
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={months}
        renderItem={renderMonth}
        keyExtractor={(date) => date.format("YYYY-MM")}
        onEndReached={loadMoreMonths}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={7}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  monthCalendar: {
    marginBottom: 0,
  },
  monthContainer: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 28, // 增大月份标题字体
    fontWeight: "bold",
    marginBottom: 16,
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
    backgroundColor: "#e6f3ff",
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
  todayText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
