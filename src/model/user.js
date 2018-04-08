var moment = require('moment');

module.exports = class extends think.Model {
  async getUser(userName, userPass) {
    return await this.field('id, user_name, user_nicename, user_email, user_url')
                    .where({
                      user_name: userName,
                      user_pass: userPass
                    })
                    .find();
  }
  async getUserById(id) {
    return await this.field('id, user_name, user_nicename, user_email, user_url')
                    .where({
                      id: id,
                    })
                    .find();
  }
  async getUserByName(userName) {
    return await this.field('id, user_name, user_nicename, user_email, user_url')
                    .where({
                      user_name: userName,
                    })
                    .find();
  }
  async getUserByEmail(userEmail) {
    return await this.field('id, user_name, user_nicename, user_email, user_url')
                    .where({
                      user_email: userEmail,
                    })
                    .find();
  }

  async addUser(data){
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
};
