import React, { Component } from 'react'

export class Spinner extends Component {
  render() {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
        <span className='ml-3 text-gray-600 font-medium'>Loading...</span>
      </div>
    )
  }
}

export default Spinner
