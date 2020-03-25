module.exports = {
  villager: {
    name: 'Dân làng',
    inf: 'Bạn không cần làm gì cả :D',
    getDefaultState: () =>({})
  },
  werewolf: {
    name: 'Sói',
    inf: 'Tất cả sói chọn cắn 1 người mỗi đêm, bla bla',
    getDefaultState: () =>({})
  },
  seer: {
    name: 'Tiên tri',
    inf: 'Tiên tri chọn 1 người để soi thông tin mỗi đêm',
    getDefaultState: () =>({})
  },
  witch: {
    name: 'Phù thủy',
    inf: 'Lên mạng search cách chơi đi, phùy thủy lằng nhằng vl',
    getDefaultState: () =>({
      didKill: false,
      didSave: false,
    })
  },
  guardian: {
    name: 'Bảo vệ',
    inf: 'Tụ google cách chơi',
    getDefaultState: () =>({
      lastTarget: null
    })
  },
  hunter: {
    name: 'Thợ săn',
    inf: 'Thợ săn chọn nhắm bắn 1 người mỗi đêm, khi thợ săn chêt, thằng đó chêt theo bla bla bla',
    getDefaultState: () =>({
      target: null
    })
  }
}