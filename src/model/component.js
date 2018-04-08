var moment = require('moment');

module.exports = class extends think.Model {
  async list(page, pageSize, userId){
    var whereData = {};
    if(userId){
      whereData.user_id = userId;
    }

    this.where(whereData);
    return await this.page(page, pageSize).order('created_at DESC').countSelect();
  }
  async search(page, pageSize, keyword){
    return await this
                .where({'label|desc': ['like', `%${keyword}%`]})
                .page(page, pageSize)
                .countSelect();
  }
  async info(id){
    var data = await this.where({id: id}).find();
    return data;
  }
  async create(data){
    data.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    data.updated_at = data.created_at;
    return await this.add(data);
  }
  async edit(updateData, whereData){
    updateData.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    return await this.where(whereData).update(updateData);
  }
  async remove(ids){
    let whereData = {
      id: ['IN', ids],
    };
    return await this.where(whereData).delete();
  }
  get relation(){
    return {
      component: {
        key: 'pid',
        // fKey: 'id',
        name: 'component',
        type: think.Model.BELONG_TO,
        relation: false,
      },
      component_extra_field: {
        name: 'extra_field',
        type: think.Model.HAS_MANY,
      }
    };
  }
};
