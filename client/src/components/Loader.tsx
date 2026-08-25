const Loader = () => {
  return (
    <div className='flex flex-col gap-4 justify-center items-center h-screen bg-surface'>
      <div className='relative w-16 h-16'>
        <div className='absolute inset-0 rounded-full border-4 border-surface-teal'></div>
        <div className='absolute inset-0 rounded-full border-4 border-t-primary animate-spin'></div>
      </div>
      <p className='font-heading text-lg font-bold text-navy'>
        LittleTech<span className='text-primary'>Tips</span>
      </p>
    </div>
  )
}

export default Loader
