import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function App() {
  const [balloonsPopped, setBalloonsPopped] = useState(0);
  const [balloonsMissed, setBalloonsMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
        // Randomly generate a new balloon with random number
        const numBalloons = Math.floor(Math.random() * 3) + 1; // Generate 1 to 3 balloons
        const newBalloons = Array.from({ length: numBalloons }, () => ({
          id: Date.now() + Math.random(),
          position: Math.random() * (windowWidth - 50),
          bottom: 0
        })).filter(balloon => !isOverlapping(balloon));

        setBalloons(prevBalloons => [...prevBalloons, ...newBalloons]);
      } else {
        clearInterval(timer);
        // Game Over
        showGameOverAlert();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const isOverlapping = (newBalloon) => {
    for (let i = 0; i < balloons.length; i++) {
      const existingBalloon = balloons[i];
      if (
        Math.abs(newBalloon.position - existingBalloon.position) < 50 &&
        Math.abs(newBalloon.bottom - existingBalloon.bottom) < 50
      ) {
        return true;
      }
    }
    return false;
  };

  const showGameOverAlert = () => {
    Alert.alert(
      'Game Over',
      `Balloons Popped: ${balloonsPopped}\nBalloons Missed: ${balloonsMissed}`,
      [{ text: 'Play Again', onPress: () => resetGame() }]
    );
  };

  const resetGame = () => {
    setBalloonsPopped(0);
    setBalloonsMissed(0);
    setTimeLeft(120);
    setBalloons([]);
  };

  const popBalloon = (id) => {
    setBalloons(prevBalloons => prevBalloons.filter(balloon => balloon.id !== id));
    setBalloonsPopped(prevPopped => prevPopped + 1);
  };

  const moveBalloons = () => {
    setBalloons(prevBalloons => 
      prevBalloons.map(balloon => {
        if (balloon.bottom >= windowHeight) {
          setBalloonsMissed(prevMissed => prevMissed + 1);
          return null;
        } else {
          return { ...balloon, bottom: balloon.bottom + 4 }; // Increase speed to 4 units per interval
        }
      }).filter(Boolean)
    );
  };

  useEffect(() => {
    const moveInterval = setInterval(moveBalloons, 50); // Move balloons every 50ms
    return () => clearInterval(moveInterval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        Time Left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
      </Text>
      <View style={styles.scoreContainer}>
        <View style={styles.score}>
          <Text style={styles.scoreText}>Balloons Popped</Text>
          <Text style={styles.scoreText}>{balloonsPopped}</Text>
        </View>
        <View style={styles.score}>
          <Text style={styles.scoreText}>Balloons Missed</Text>
          <Text style={styles.scoreText}>{balloonsMissed}</Text>
        </View>
      </View>
      <View style={styles.gameContainer}>
        {balloons.map(balloon => (
          <Balloon key={balloon.id} position={balloon} popBalloon={() => popBalloon(balloon.id)} />
        ))}
      </View>
    </View>
  );
}

const Balloon = ({ position, popBalloon }) => (
  <TouchableOpacity onPress={popBalloon} style={[styles.balloon, { left: position.position, bottom: position.bottom }]}>
    <Image source={require('./assets/balloon.jpeg')} style={styles.balloonImage} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontSize: 24,
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  score: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  balloon: {
    position: 'absolute',
  },
  balloonImage: {
    width: 50,
    height: 50,
  },
});
