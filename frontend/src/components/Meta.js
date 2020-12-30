import React from 'react'
import Helmet from 'react-helmet'

const Meta = ({title, description, keywords}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />
        </Helmet>
    )
}

Meta.defaultProps = {
    title: 'Trail Magic From Your Desk',
    keywords: 'thru-hike, thru hikers, applachian trail, hostel, trail magic, trail magic desk, bunk, trail magic beer',
    description: 'Friends and family of hikers can purchase bunks, beers/food, and shuttles for those on trail.'
};

export default Meta
