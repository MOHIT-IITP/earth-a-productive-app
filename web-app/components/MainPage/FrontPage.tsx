'use client'
import Aurora from './Aurora'
import React from 'react'

const FrontPage = () => {
    return (
        <Aurora
            colorStops={["#1E40AF", "#10B981"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
        />
    )

}

export default FrontPage