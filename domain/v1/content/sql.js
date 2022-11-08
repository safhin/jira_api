class Contentinfo {

    static InsertTask(task) {
        let sql =  "INSERT INTO `tasks`(`title`,`description`, `status`) VALUES ('"+task.title+"','"+task.description+"','"+task.status+"')";

        return sql;
    }
    static UpdateTask(id,status) {
        let sql =  "UPDATE `tasks` SET status = ('"+status+"') WHERE id = ('"+id+"')";
        return sql;
    }

    static DeleteTask(id) {
        let sql =  "DELETE FROM `tasks` WHERE id = ('"+id+"')";
        return sql;
    }

    static AllTaskSQL() {
        let sql = `SELECT * FROM tasks`;
        return sql;
     }

    static PlaylistInfoSQL() {
        let sql = `SELECT id as playlist_id,playlist_name,playlist_position,playlist_type FROM playlist_tbl WHERE is_published = 1 order by playlist_position ASC`;

        return sql;
    }

    static PlaylistCountSQL() {
        let sql = `SELECT count(*) as playlist_count FROM playlist_tbl WHERE is_published = 1`;

        return sql;
    }

    static playlistwithpaginationSQL(start_from, per_page_count) {
        let sql = `SELECT id as playlist_id,playlist_name,playlist_position  FROM playlist_tbl WHERE is_published = 1 order by playlist_position ASC LIMIT ${start_from}, ${per_page_count}`;

        return sql;
    }


    static AlbumContentSql(album_id) {
        let sql = `SELECT content_uid,position_in_page,title,category,genrs,cast,director,video_duration,production_house_name,description,tag,img_banner,img_lanscape,img_portrait,video_url,trailer_link,release_date,is_premium,album_name,album_id FROM content_tbl WHERE is_published = 1 and album_id='${album_id}'`;

        return sql;
    }

    static CategoryContentSql(category) {
        let sql = `SELECT 
        content_uid,position_in_page,title,category,genrs,cast,director,video_duration,production_house_name,description,tag,img_banner,img_lanscape,img_portrait,video_url,trailer_link,release_date,is_premium,album_name,album_id FROM content_tbl WHERE is_published = 1 and category='${category}'`;

        return sql;
    }

    static ContentInfoSQL(playlist_id) {
        let sql = `SELECT * FROM playlist_content_tbl WHERE playlist_id = '${playlist_id }' && is_published = 1 order by position_in_page ASC`;

        return sql;
    }

    static RelatedContentInfoSQL(playlist_id,content_uid) {
        let sql = `SELECT * FROM playlist_content_tbl WHERE playlist_id = '${playlist_id }' && content_uid NOT IN ('${content_uid}') order by position_in_page ASC`;
        console.log(sql)
        return sql;
    }

    static RelatedcontentSQL(artist) {
        let sql = `SELECT content_uid,position_in_page,title,category,genrs,cast,director,video_duration,production_house_name,description,tag,img_banner,img_lanscape,img_portrait,video_url,trailer_link,release_date,is_premium,album_name,album_id FROM content_tbl WHERE is_published = 1 and cast like '%${artist}%'`;

        return sql;
    }


    static SearchSQL(searchKey) {
        let sql = `SELECT content_uid,position_in_page,title,category,genrs,cast,director,video_duration,production_house_name,description,tag,img_banner,img_lanscape,img_portrait,video_url,trailer_link,release_date,is_premium,album_name,album_id FROM content_tbl WHERE is_published = 1 and tag like '%${searchKey}%' order by  STR_TO_DATE(video_duration,'%H:%i:%s') DESC`;

        return sql;
    }

    static ContentDetailSQL(content_uid) {
        let sql = `SELECT * FROM playlist_content_tbl WHERE content_uid='${content_uid}'`;

       return sql;
    }


    static AllContentSQL(playlist_id) {
       
       let sql = `SELECT * FROM playlist_content_tbl WHERE playlist_id = '${playlist_id }' order by position_in_page ASC`;

       return sql;
    }

    static PackListSQL() {
       
       let sql = `SELECT * FROM pack_tbl order by id ASC`;

       return sql;
    }

}

module.exports = Contentinfo;