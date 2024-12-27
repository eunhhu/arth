import { Transition } from "framer-motion";

export const smooth:Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
}

export const spring:Transition = {
  type: 'spring',
  damping: 10,
  stiffness: 100,
  duration: 0.4,
}
