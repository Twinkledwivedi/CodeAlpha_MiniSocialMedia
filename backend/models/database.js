const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

class Database {
    constructor(filename) {
        this.filePath = path.join(dataDir, filename);
    }

    read() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    write(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    findAll() {
        return this.read();
    }

    findById(id) {
        const items = this.read();
        return items.find(item => item.id === id);
    }

    create(newItem) {
        const items = this.read();
        items.push(newItem);
        this.write(items);
        return newItem;
    }

    update(id, updatedItem) {
        const items = this.read();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            this.write(items);
            return items[index];
        }
        return null;
    }

    delete(id) {
        const items = this.read();
        const filteredItems = items.filter(item => item.id !== id);
        this.write(filteredItems);
        return filteredItems.length !== items.length;
    }

    findByField(field, value) {
        const items = this.read();
        return items.find(item => item[field] === value);
    }
}

module.exports = Database;
