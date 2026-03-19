import { StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { getSessionById } from '@/lib/api'
import { useState, useEffect } from 'react'

export default function SessionDetailScreen() {

    const [sessionData, setSessionData] = useState({})
    const { id } = useLocalSearchParams<{ id: string }>()
    useEffect(() => {
        const fetchSession = async () => {
            const data = await getSessionById(id)
            setSessionData(data)
        }
        fetchSession()
    }, [id])
    console.log(sessionData)
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Session {id}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    text: {
        color: '#fff',
        fontSize: 18,
    },
})
