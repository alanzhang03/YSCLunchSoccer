import React from 'react'
import styles from "./SessionCard.module.scss"
import Card from '../ui/Card'

const SessionCard = () => {
    const testingSessionData = {
        date: "1/28/2004",
        time: "11:30 am - 1:05 pm EST",
        available: "10/35",
    }
  return (
      <Card
      sessionData={testingSessionData}
      >
          
      </Card>
      
  )
}

export default SessionCard