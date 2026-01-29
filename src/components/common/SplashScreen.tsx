import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

// Animated dot component for loading
function AnimatedDot({ delay }: { delay: number }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

// Gold icon component
function GoldIcon() {
  return (
    <View style={styles.appIcon}>
      <LinearGradient
        colors={['#d4af37', '#f9e076', '#d4af37']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <View style={styles.iconInner}>
          <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
            <Defs>
              <SvgLinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#d4af37" />
                <Stop offset="50%" stopColor="#f9e076" />
                <Stop offset="100%" stopColor="#d4af37" />
              </SvgLinearGradient>
            </Defs>
            {/* Gold bar icon */}
            <Path
              d="M12 1v22M5 8h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"
              stroke="url(#goldGrad)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={15} r={2} stroke="url(#goldGrad)" strokeWidth={1.5} />
          </Svg>
        </View>
      </LinearGradient>
    </View>
  );
}

// Mini chart component
function MiniChart() {
  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={80} viewBox="0 0 300 80">
        <Defs>
          <SvgLinearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#d4af37" />
            <Stop offset="100%" stopColor="#f9e076" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M10,60 C40,40 70,70 100,50 C130,30 160,65 190,45 C220,25 250,55 290,35"
          stroke="url(#chartGrad)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const iconScale = useSharedValue(0.5);
  const iconOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const chartOpacity = useSharedValue(0);

  useEffect(() => {
    // Icon animation
    iconScale.value = withDelay(
      200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );
    iconOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 400 })
    );

    // Title animation
    titleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500 })
    );
    titleTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );

    // Chart animation
    chartOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 500 })
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0c0c14', '#1a1a2e', '#0c0c14']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Light effect */}
      <View style={styles.lightEffect} />

      {/* Geometric pattern overlay */}
      <View style={styles.patternOverlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* App Icon */}
        <Animated.View style={iconAnimatedStyle}>
          <GoldIcon />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.title}>Gold Tracker</Text>
          <Text style={styles.subtitle}>Theo dõi giá vàng toàn cầu</Text>
        </Animated.View>

        {/* Mini Chart */}
        <Animated.View style={[styles.goldInfo, chartAnimatedStyle]}>
          <View style={styles.priceDisplay}>
            <Text style={styles.currentPrice}>67.850.000</Text>
            <View style={styles.priceChange}>
              <Text style={styles.priceChangeText}>+0.45%</Text>
            </View>
          </View>
          <MiniChart />
        </Animated.View>

        {/* Loading */}
        <Animated.View 
          style={styles.loadingContainer}
          entering={FadeIn.delay(1200).duration(400)}
        >
          <Text style={styles.loadingText}>Đang tải</Text>
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} />
            <AnimatedDot delay={200} />
            <AnimatedDot delay={400} />
          </View>
        </Animated.View>
      </View>

      {/* Developer info */}
      <Text style={styles.developer}>© 2025 Gold Tracker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c14',
  },
  lightEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  appIcon: {
    width: 140,
    height: 140,
    borderRadius: 28,
    marginBottom: 40,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 110,
    height: 110,
    backgroundColor: '#0c0c14',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#d4af37',
    letterSpacing: 1,
    marginBottom: 12,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#aaa',
    letterSpacing: 0.5,
  },
  goldInfo: {
    width: '100%',
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#d4af37',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  priceChange: {
    backgroundColor: 'rgba(30, 180, 90, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceChangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1eb45a',
  },
  chartContainer: {
    width: '100%',
    height: 80,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: '400',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: '#d4af37',
    borderRadius: 5,
  },
  developer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '300',
  },
});

export default SplashScreen;
