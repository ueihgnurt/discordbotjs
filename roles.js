module.exports = {
  villager: {
    name: 'Dân làng',
    inf: 'Bạn không cần làm gì cả',
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
    inf: 'Bạn chỉ có 2 bình thuốc cho cả game 1 bình cứu người và 1 bình giết người.Bạn được quyền giết hoặc cứu đứa nào đấy',
    getDefaultState: () =>({
      didKill: false,
      didSave: false,
    })
  },
  guardian: {
    name: 'Bảo vệ',
    inf: 'chọn một đứa để bảo kê hoặc bảo kê bản thân khỏi sói',
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